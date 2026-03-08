import { useState, useEffect } from 'react';
import RawMaterialStage from './stages/RawMaterialStage';
import RoastingStage from './stages/RoastingStage';
import JaggeryStage from './stages/JaggeryStage';
import ClosingStage from './stages/ClosingStage';
import './ProcessFlow.css';

const STAGES = [
    {
        id: 'raw',
        label: 'Raw Material',
        shortLabel: 'Raw',
        icon: '🥜',
        description: 'Load peanuts & measure humidity',
        getStats: (batch) => {
            const loads = batch.rawMaterials || [];
            const total = loads.reduce((s, r) => s + r.weightKg, 0);
            const avgH = loads.length > 0
                ? (loads.reduce((s, r) => s + r.humidity, 0) / loads.length).toFixed(1)
                : null;
            return {
                lines: [
                    { label: 'Weight', value: `${total.toFixed(1)} kg`, color: 'text-brand-400' },
                    { label: 'Humidity', value: avgH ? `${avgH}%` : '—', color: 'text-sky-400' },
                    { label: 'Loads', value: loads.length, color: 'text-emerald-400' },
                ],
                count: loads.length,
            };
        },
    },
    {
        id: 'roasting',
        label: 'Roasting',
        shortLabel: 'Roast',
        icon: '🌡️',
        description: 'Monitor temperature',
        getStats: (batch) => {
            const readings = batch.roastingReadings || [];
            const temps = readings.map(r => r.temperature);
            const avg = readings.length > 0
                ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : null;
            return {
                lines: [
                    { label: 'Avg', value: avg ? `${avg}°C` : '—', color: 'text-orange-400' },
                    { label: 'Min', value: readings.length > 0 ? `${Math.min(...temps)}°C` : '—', color: 'text-sky-400' },
                    { label: 'Max', value: readings.length > 0 ? `${Math.max(...temps)}°C` : '—', color: 'text-red-400' },
                ],
                count: readings.length,
            };
        },
    },
    {
        id: 'jaggery',
        label: 'Jaggery Mixing',
        shortLabel: 'Jaggery',
        icon: '🍯',
        description: 'Density & viscosity',
        getStats: (batch) => {
            const readings = batch.jaggeryReadings || [];
            const totalVol = readings.reduce((s, r) => s + r.volumeLiters, 0);
            const avgD = readings.length > 0
                ? (readings.reduce((s, r) => s + r.density, 0) / readings.length).toFixed(2) : null;
            const avgV = readings.length > 0
                ? (readings.reduce((s, r) => s + r.viscosity, 0) / readings.length).toFixed(0) : null;
            return {
                lines: [
                    { label: 'Volume', value: `${totalVol.toFixed(1)} L`, color: 'text-brand-400' },
                    { label: 'Density', value: avgD ? `${avgD}` : '—', color: 'text-amber-400' },
                    { label: 'Viscosity', value: avgV ? `${avgV} cP` : '—', color: 'text-purple-400' },
                ],
                count: readings.length,
            };
        },
    },
    {
        id: 'close',
        label: 'Output',
        shortLabel: 'Output',
        icon: '📦',
        description: 'Final results',
        getStats: (batch) => ({
            lines: [
                { label: 'Qty', value: batch.status === 'completed' ? `${batch.result?.actualQuantityKg} kg` : 'Pending', color: 'text-brand-400' },
                { label: 'Quality', value: batch.status === 'completed' ? `${batch.result?.actualQuality}/10` : '—', color: 'text-emerald-400' },
            ],
            count: batch.status === 'completed' ? 1 : 0,
        }),
    },
];

export default function ProcessFlow({ batch, onAddRawMaterial, onAddRoastingReading, onAddJaggeryReading, onCompleteBatch, onNavigate }) {
    const [selectedStage, setSelectedStage] = useState(null);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setParticles(prev => {
                const updated = prev
                    .map(p => ({ ...p, progress: p.progress + p.speed }))
                    .filter(p => p.progress <= 100);
                if (Math.random() < 0.3 && updated.length < 8) {
                    const pipeIndex = Math.floor(Math.random() * 3);
                    updated.push({
                        id: Date.now() + Math.random(),
                        pipe: pipeIndex,
                        progress: 0,
                        speed: 1.5 + Math.random() * 1.5,
                        size: 3 + Math.random() * 3,
                    });
                }
                return updated;
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const handleComplete = (result) => {
        onCompleteBatch(batch.id, result);
        onNavigate('dashboard');
    };

    return (
        <div className="space-y-3 lg:space-y-6">
            {/* ─── MOBILE/TABLET: Horizontal scrollable pipeline ─── */}
            <div className="lg:hidden">
                <div className="flow-horiz-pipeline">
                    {STAGES.map((stage, idx) => {
                        const stats = stage.getStats(batch);
                        const isSelected = selectedStage === stage.id;
                        const hasData = stats.count > 0;

                        return (
                            <div key={stage.id} className="flow-horiz-stage">
                                <button
                                    onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                                    className={`flow-horiz-node ${isSelected ? 'flow-horiz-node--selected' : ''} ${hasData ? 'flow-horiz-node--active' : ''}`}
                                >
                                    <span className="text-lg">{stage.icon}</span>
                                    <span className="flow-horiz-node__label">{stage.shortLabel}</span>
                                    {stats.count > 0 && (
                                        <span className="flow-horiz-node__badge">{stats.count}</span>
                                    )}
                                    {/* Key stat on node */}
                                    <span className={`flow-horiz-node__value ${stats.lines[0]?.color || ''}`}>
                                        {stats.lines[0]?.value}
                                    </span>
                                </button>
                                {idx < STAGES.length - 1 && (
                                    <div className="flow-horiz-pipe">
                                        <div className="flow-horiz-pipe__line" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Measurement panel below pipeline */}
                {selectedStage === null && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 text-center mt-3">
                        <p className="text-2xl mb-2">👆</p>
                        <p className="text-sm text-gray-400">Tap a stage to add measurements</p>
                    </div>
                )}
                {selectedStage === 'raw' && (
                    <RawMaterialStage batch={batch} onAdd={(data) => onAddRawMaterial(batch.id, data)} />
                )}
                {selectedStage === 'roasting' && (
                    <RoastingStage batch={batch} onAdd={(data) => onAddRoastingReading(batch.id, data)} />
                )}
                {selectedStage === 'jaggery' && (
                    <JaggeryStage batch={batch} onAdd={(data) => onAddJaggeryReading(batch.id, data)} />
                )}
                {selectedStage === 'close' && (
                    <ClosingStage batch={batch} onComplete={handleComplete} />
                )}
            </div>

            {/* ─── DESKTOP: Side-by-side layout, fills container height ─── */}
            <div className="hidden lg:flex gap-6 h-full">
                {/* Vertical Pipeline — distribute nodes evenly */}
                <div className="w-64 shrink-0 h-full">
                    <div className="process-pipeline h-full justify-between">
                        {STAGES.map((stage, idx) => {
                            const stats = stage.getStats(batch);
                            const isSelected = selectedStage === stage.id;
                            const hasData = stats.count > 0;

                            return (
                                <div key={stage.id} className="process-stage-wrapper">
                                    <button
                                        onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                                        className={`process-node ${isSelected ? 'process-node--selected' : ''} ${hasData ? 'process-node--active' : 'process-node--empty'}`}
                                    >
                                        {hasData && <div className="process-node__glow" />}
                                        <div className="process-node__content">
                                            <div className="process-node__header">
                                                <span className="process-node__icon">{stage.icon}</span>
                                                <div className="process-node__info">
                                                    <span className="process-node__label">{stage.label}</span>
                                                    <span className="process-node__desc">{stage.description}</span>
                                                </div>
                                                {stats.count > 0 && (
                                                    <span className="process-node__badge">{stats.count}</span>
                                                )}
                                            </div>
                                            <div className="process-node__stats">
                                                {stats.lines.map(line => (
                                                    <div key={line.label} className="process-node__stat-item">
                                                        <span className="process-node__stat-label">{line.label}</span>
                                                        <span className={`process-node__stat-value ${line.color}`}>{line.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="process-node__arrow">
                                                <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                                                    <path d="M2 2L10 10L2 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                    {idx < STAGES.length - 1 && (
                                        <div className="process-pipe process-pipe--flex">
                                            <div className="process-pipe__line" />
                                            <div className="process-pipe__flow" />
                                            {particles
                                                .filter(p => p.pipe === idx)
                                                .map(p => (
                                                    <div
                                                        key={p.id}
                                                        className="process-pipe__particle"
                                                        style={{
                                                            top: `${p.progress}%`,
                                                            width: `${p.size}px`,
                                                            height: `${p.size}px`,
                                                        }}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Measurement Panel — scrolls internally */}
                <div className="flex-1 min-w-0 overflow-y-auto">
                    {selectedStage === null && (
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                            <div className="text-4xl mb-4">👈</div>
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">Select a Stage</h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                                Click any stage in the process flow to view details and add measurements.
                            </p>
                        </div>
                    )}
                    {selectedStage === 'raw' && (
                        <RawMaterialStage batch={batch} onAdd={(data) => onAddRawMaterial(batch.id, data)} />
                    )}
                    {selectedStage === 'roasting' && (
                        <RoastingStage batch={batch} onAdd={(data) => onAddRoastingReading(batch.id, data)} />
                    )}
                    {selectedStage === 'jaggery' && (
                        <JaggeryStage batch={batch} onAdd={(data) => onAddJaggeryReading(batch.id, data)} />
                    )}
                    {selectedStage === 'close' && (
                        <ClosingStage batch={batch} onComplete={handleComplete} />
                    )}
                </div>
            </div>
        </div>
    );
}
