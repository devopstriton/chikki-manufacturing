import { useState, useEffect } from 'react';
import QualityBadge from './QualityBadge';
import { fetchBatches } from '../services/api';

export default function History({ onDeleteBatch }) {
    const [batches, setBatches] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBatches, setTotalBatches] = useState(0);

    const fetchHistory = () => {
        fetchBatches({
            page,
            limit: 10,
            status: filterStatus,
            search: searchTerm
        })
            .then(data => {
                setBatches(data.batches || []);
                setTotalPages(data.totalPages || 1);
                setTotalBatches(data.totalBatches || 0);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchHistory();
    }, [page, filterStatus, searchTerm]); // re-fetch when these change

    const handleDelete = async (id) => {
        await onDeleteBatch(id);
        fetchHistory();
    };

    const avg = (arr, key) =>
        arr && arr.length > 0 ? (arr.reduce((s, r) => s + Number(r[key]), 0) / arr.length).toFixed(1) : '—';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Batch History</h2>
                    <p className="text-sm text-gray-400 mt-1">{totalBatches} total batches found</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search by batch ID..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
                <div className="flex gap-2">
                    {['all', 'completed', 'open'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilterStatus(f); setPage(1); }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${filterStatus === f
                                ? f === 'completed' ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                                    : f === 'open' ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30'
                                        : 'bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Batch Cards */}
            {batches.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-12 text-center">
                    <p className="text-gray-500">No batches match your filters.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {batches.map(b => {
                        const isOpen = b.status === 'open';
                        const expanded = expandedId === b.id;
                        const yieldPct = b.result && b.plan.expectedQuantityKg > 0
                            ? ((b.result.actualQuantityKg / b.plan.expectedQuantityKg) * 100).toFixed(1)
                            : null;
                        const qualityDelta = b.result
                            ? b.result.actualQuality - b.plan.expectedQuality
                            : null;

                        return (
                            <div key={b.id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10">
                                {/* Collapsed row */}
                                <button
                                    onClick={() => setExpandedId(expanded ? null : b.id)}
                                    className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-brand-400 font-bold">{b.id}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isOpen
                                                ? 'bg-blue-500/15 text-blue-400'
                                                : 'bg-emerald-500/15 text-emerald-400'
                                                }`}>
                                                {isOpen ? '🔄 Open' : '✅ Completed'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(b.createdAt).toLocaleDateString()} · {new Date(b.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>

                                    {/* Key stats */}
                                    <div className="hidden sm:flex items-center gap-6 text-xs">
                                        <div className="text-center">
                                            <p className="text-gray-500">Expected</p>
                                            <p className="text-white font-bold">{b.plan.expectedQuality}/10</p>
                                        </div>
                                        {b.result && (
                                            <>
                                                <div className="text-center">
                                                    <p className="text-gray-500">Actual</p>
                                                    <p className="text-white font-bold">{b.result.actualQuality}/10</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-gray-500">Delta</p>
                                                    <p className={`font-bold ${qualityDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {qualityDelta >= 0 ? '+' : ''}{qualityDelta}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-gray-500">Yield</p>
                                                    {yieldPct ? (
                                                        <p className={`font-bold ${Number(yieldPct) >= 90 ? 'text-emerald-400' : Number(yieldPct) >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                                                            {yieldPct}%
                                                        </p>
                                                    ) : (
                                                        <p className="font-bold text-gray-600">—</p>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {b.result && <QualityBadge quality={b.result.actualQuality} />}

                                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Expanded detail */}
                                {expanded && (
                                    <div className="border-t border-white/5 px-5 py-5 space-y-4">
                                        {/* Process data grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Raw Materials */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                    🥜 Raw Material ({b.rawMaterials?.length || 0} loads)
                                                </h4>
                                                {b.rawMaterials?.length > 0 ? (
                                                    <div className="space-y-1.5 text-xs">
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Total Weight</span>
                                                            <span className="text-white font-bold">{b.rawMaterials.reduce((s, r) => s + r.weightKg, 0).toFixed(1)} kg</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Avg Humidity</span>
                                                            <span className="text-white font-bold">{avg(b.rawMaterials, 'humidity')}%</span>
                                                        </div>
                                                    </div>
                                                ) : <p className="text-xs text-gray-600">No data</p>}
                                            </div>

                                            {/* Roasting */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                    🌡️ Roasting ({b.roastingReadings?.length || 0} readings)
                                                </h4>
                                                {b.roastingReadings?.length > 0 ? (
                                                    <div className="space-y-1.5 text-xs">
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Avg Temp</span>
                                                            <span className="text-white font-bold">{avg(b.roastingReadings, 'temperature')}°C</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Min / Max</span>
                                                            <span className="text-white font-bold">
                                                                {Math.min(...b.roastingReadings.map(r => r.temperature))}° / {Math.max(...b.roastingReadings.map(r => r.temperature))}°C
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : <p className="text-xs text-gray-600">No data</p>}
                                            </div>

                                            {/* Jaggery */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                    🍯 Jaggery ({b.jaggeryReadings?.length || 0} readings)
                                                </h4>
                                                {b.jaggeryReadings?.length > 0 ? (
                                                    <div className="space-y-1.5 text-xs">
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Total Volume</span>
                                                            <span className="text-white font-bold">{b.jaggeryReadings.reduce((s, r) => s + r.volumeLiters, 0).toFixed(1)} L</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Avg Density</span>
                                                            <span className="text-white font-bold">{avg(b.jaggeryReadings, 'density')} g/ml</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Avg Viscosity</span>
                                                            <span className="text-white font-bold">{avg(b.jaggeryReadings, 'viscosity')} cP</span>
                                                        </div>
                                                    </div>
                                                ) : <p className="text-xs text-gray-600">No data</p>}
                                            </div>
                                        </div>

                                        {/* Results comparison */}
                                        {b.result && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[
                                                    { label: 'Actual Quality', value: `${b.result.actualQuality}/10`, color: b.result.actualQuality >= 8 ? 'text-emerald-400' : b.result.actualQuality >= 5 ? 'text-amber-400' : 'text-red-400' },
                                                    { label: 'Actual Qty', value: `${b.result.actualQuantityKg} kg`, color: 'text-white' },
                                                    { label: 'Wastage', value: `${b.result.wastageKg} kg`, color: 'text-red-400' },
                                                    { label: 'Yield', value: `${yieldPct}%`, color: Number(yieldPct) >= 90 ? 'text-emerald-400' : 'text-amber-400' },
                                                ].map(s => (
                                                    <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                                                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                                                        <p className={`text-lg font-bold ${s.color} mt-0.5`}>{s.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {b.result?.notes && (
                                            <p className="text-xs text-gray-500 bg-white/[0.02] rounded-lg p-3">
                                                📝 {b.result.notes}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDelete(b.id)}
                                                className="text-red-400/60 hover:text-red-400 text-xs flex items-center gap-1 transition-all cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed text-gray-500' : 'bg-white/5 text-white hover:bg-white/10 cursor-pointer'}`}
                    >
                        Previous
                    </button>
                    <span className="text-gray-400 text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${page === totalPages ? 'opacity-50 cursor-not-allowed text-gray-500' : 'bg-white/5 text-white hover:bg-white/10 cursor-pointer'}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
