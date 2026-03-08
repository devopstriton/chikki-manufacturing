import { useState } from 'react';
import RawMaterialStage from './stages/RawMaterialStage';
import RoastingStage from './stages/RoastingStage';
import JaggeryStage from './stages/JaggeryStage';
import ClosingStage from './stages/ClosingStage';
import ProcessFlow from './ProcessFlow';
import './ProcessFlow.css';

const TABS = [
    { id: 'raw', label: '🥜 Raw', fullLabel: '🥜 Raw Material', countKey: 'rawMaterials' },
    { id: 'roasting', label: '🌡️ Roast', fullLabel: '🌡️ Roasting', countKey: 'roastingReadings' },
    { id: 'jaggery', label: '🍯 Jaggery', fullLabel: '🍯 Jaggery Syrup', countKey: 'jaggeryReadings' },
    { id: 'close', label: '✅ Close', fullLabel: '✅ Close Batch', countKey: null },
];

export default function BatchProcess({
    activeBatch,
    onCreateBatch,
    onAddRawMaterial,
    onAddRoastingReading,
    onAddJaggeryReading,
    onCompleteBatch,
    onNavigate,
}) {
    const [expectedQuality, setExpectedQuality] = useState('');
    const [expectedQuantityKg, setExpectedQuantityKg] = useState('');
    const [planError, setPlanError] = useState('');
    const [activeTab, setActiveTab] = useState('raw');
    const [viewMode, setViewMode] = useState('flow');

    const inputClass = "w-full bg-white/5 border border-white/10 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-all";

    // — PLANNING MODE (no active batch) —
    if (!activeBatch) {
        const handleStart = () => {
            if (!expectedQuality || Number(expectedQuality) < 1 || Number(expectedQuality) > 10) {
                setPlanError('Quality must be 1-10');
                return;
            }
            if (!expectedQuantityKg || Number(expectedQuantityKg) <= 0) {
                setPlanError('Enter expected quantity in kg');
                return;
            }
            setPlanError('');
            onCreateBatch({ expectedQuality, expectedQuantityKg });
        };

        return (
            <div className="max-w-xl mx-auto">
                <div className="mb-6 lg:mb-8">
                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">Start New Batch</h2>
                    <p className="text-gray-400 text-xs lg:text-sm">
                        Set your target quality and quantity.
                    </p>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 lg:p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            ⭐ Expected Quality <span className="text-brand-400">(1-10)</span>
                        </label>
                        <input
                            type="number" min="1" max="10" step="1"
                            placeholder="e.g. 8" value={expectedQuality}
                            onChange={e => setExpectedQuality(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            📦 Expected Quantity <span className="text-brand-400">(kg)</span>
                        </label>
                        <input
                            type="number" step="0.1"
                            placeholder="e.g. 50" value={expectedQuantityKg}
                            onChange={e => setExpectedQuantityKg(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {planError && <p className="text-red-400 text-xs">{planError}</p>}

                    <button
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:-translate-y-0.5 cursor-pointer"
                    >
                        🚀 Start Batch
                    </button>
                </div>
            </div>
        );
    }

    // — LIVE BATCH CONSOLE (active batch open) —
    const batch = activeBatch;
    const elapsed = () => {
        const diff = Date.now() - new Date(batch.createdAt).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        if (hrs > 0) return `${hrs}h ${mins % 60}m`;
        return `${mins}m`;
    };

    const totalRawWeight = (batch.rawMaterials || []).reduce((s, r) => s + r.weightKg, 0);
    const avgTemp = batch.roastingReadings?.length > 0
        ? (batch.roastingReadings.reduce((s, r) => s + r.temperature, 0) / batch.roastingReadings.length).toFixed(1)
        : '—';
    const totalJaggery = (batch.jaggeryReadings || []).reduce((s, r) => s + r.volumeLiters, 0);

    const handleComplete = (result) => {
        onCompleteBatch(batch.id, result);
        onNavigate('dashboard');
    };

    const summaryItems = [
        { label: 'Raw', value: `${totalRawWeight.toFixed(1)} kg`, sub: `${batch.rawMaterials?.length || 0} loads`, color: 'text-brand-400' },
        { label: 'Roasting', value: `${avgTemp}°C`, sub: `${batch.roastingReadings?.length || 0} reads`, color: 'text-orange-400' },
        { label: 'Jaggery', value: `${totalJaggery.toFixed(1)} L`, sub: `${batch.jaggeryReadings?.length || 0} reads`, color: 'text-amber-400' },
        { label: 'Target', value: `${batch.plan.expectedQuality}/10`, sub: `${batch.plan.expectedQuantityKg} kg`, color: 'text-blue-400' },
    ];

    return (
        <div className="lg:flex lg:flex-col lg:h-[calc(100vh-4rem)] space-y-3 lg:space-y-0 lg:gap-3">
            {/* Batch header — compact on mobile, shrink-0 on desktop */}
            <div className="lg:shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-lg font-bold">
                            {batch.id}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            LIVE
                        </span>
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-white">Live Batch Console</h2>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('tabs')}
                            className={`view-toggle__btn ${viewMode === 'tabs' ? 'view-toggle__btn--active' : ''}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="1" y="1" width="14" height="4" rx="1" />
                                <rect x="1" y="7" width="14" height="4" rx="1" />
                            </svg>
                            <span className="hidden sm:inline">Tabs</span>
                        </button>
                        <button
                            onClick={() => setViewMode('flow')}
                            className={`view-toggle__btn ${viewMode === 'flow' ? 'view-toggle__btn--active' : ''}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="8" cy="3" r="2" />
                                <circle cx="8" cy="8" r="2" />
                                <circle cx="8" cy="13" r="2" />
                                <line x1="8" y1="5" x2="8" y2="6" />
                                <line x1="8" y1="10" x2="8" y2="11" />
                            </svg>
                            <span className="hidden sm:inline">Flow</span>
                        </button>
                    </div>
                    <div className="text-[10px] text-gray-500 hidden sm:block">
                        {elapsed()} ago
                    </div>
                </div>
            </div>

            {/* Summary strip — shrink-0 */}
            <div className="lg:shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                {summaryItems.map(s => (
                    <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 lg:px-4 lg:py-3">
                        <p className="text-[9px] lg:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                        <p className={`text-base lg:text-lg font-bold ${s.color} mt-0.5`}>{s.value}</p>
                        <p className="text-[9px] lg:text-[10px] text-gray-600">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ═══ TAB VIEW — fills remaining height ═══ */}
            {viewMode === 'tabs' && (
                <div className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col lg:gap-3">
                    {/* Tab navigation — compact on mobile, full on desktop */}
                    <div className="lg:shrink-0 flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1">
                        {TABS.map(tab => {
                            const count = tab.countKey ? (batch[tab.countKey]?.length || 0) : null;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1 py-2.5 px-1 lg:px-3 rounded-lg text-[11px] lg:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-brand-500/15 text-brand-400 shadow-lg shadow-brand-500/10'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                        }`}
                                >
                                    <span className="hidden lg:inline">{tab.fullLabel}</span>
                                    <span className="lg:hidden">{tab.label}</span>
                                    {count !== null && count > 0 && (
                                        <span className="bg-white/10 text-gray-300 text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active tab content — scrolls internally on desktop */}
                    <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto mt-3 lg:mt-0">
                        {activeTab === 'raw' && (
                            <RawMaterialStage batch={batch} onAdd={(data) => onAddRawMaterial(batch.id, data)} />
                        )}
                        {activeTab === 'roasting' && (
                            <RoastingStage batch={batch} onAdd={(data) => onAddRoastingReading(batch.id, data)} />
                        )}
                        {activeTab === 'jaggery' && (
                            <JaggeryStage batch={batch} onAdd={(data) => onAddJaggeryReading(batch.id, data)} />
                        )}
                        {activeTab === 'close' && (
                            <ClosingStage batch={batch} onComplete={handleComplete} />
                        )}
                    </div>
                </div>
            )}

            {/* ═══ PROCESS FLOW VIEW — fills remaining height ═══ */}
            {viewMode === 'flow' && (
                <div className="lg:flex-1 lg:min-h-0">
                    <ProcessFlow
                        batch={batch}
                        onAddRawMaterial={onAddRawMaterial}
                        onAddRoastingReading={onAddRoastingReading}
                        onAddJaggeryReading={onAddJaggeryReading}
                        onCompleteBatch={onCompleteBatch}
                        onNavigate={onNavigate}
                    />
                </div>
            )}
        </div>
    );
}
