import { useState, useEffect } from 'react';
import QualityBadge from './QualityBadge';
import ScatterChart from './ScatterChart';
import { fetchDashboardInsights, fetchDashboardScatterData } from '../services/api';

const statCards = [
    {
        key: 'total',
        label: 'Total Batches',
        icon: '📦',
        format: v => v,
        gradient: 'from-blue-500/20 to-cyan-500/20',
        textColor: 'text-cyan-400',
    },
    {
        key: 'completed',
        label: 'Completed',
        icon: '✅',
        format: v => v,
        gradient: 'from-emerald-500/20 to-green-500/20',
        textColor: 'text-emerald-400',
    },
    {
        key: 'avgQuality',
        label: 'Avg Quality',
        icon: '⭐',
        format: v => `${v}/10`,
        gradient: 'from-brand-500/20 to-yellow-500/20',
        textColor: 'text-brand-400',
    },
    {
        key: 'avgTemperature',
        label: 'Avg Temperature',
        icon: '🌡️',
        format: v => `${v}°C`,
        gradient: 'from-orange-500/20 to-red-500/20',
        textColor: 'text-orange-400',
    },
];

export default function Dashboard({ batches, stats, onNavigate, getBatchAverages }) {
    const [insights, setInsights] = useState([]);
    const [scatterData, setScatterData] = useState([]);

    useEffect(() => {
        // Fetch insights using centralized API service
        fetchDashboardInsights()
            .then(data => setInsights(data))
            .catch(console.error);

        // Fetch scatter data using centralized API service
        fetchDashboardScatterData()
            .then(data => setScatterData(data))
            .catch(console.error);
    }, [stats.total]); // Re-fetch if total batches change

    const completed = batches.filter(b => b.status === 'completed');
    const recentBatches = completed.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <p className="text-sm text-gray-400 mt-1">Manufacturing process overview</p>
                </div>
                <button
                    id="btn-new-batch-from-dash"
                    onClick={() => onNavigate('new-batch')}
                    className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-medium text-sm py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/25 hover:-translate-y-0.5 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
                    </svg>
                    {stats.open > 0 ? 'Resume Active Batch' : 'New Batch'}
                </button>
            </div>

            {/* Active batch alert */}
            {stats.open > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm text-emerald-300 font-medium">
                            You have an active batch in progress
                        </span>
                    </div>
                    <button
                        onClick={() => onNavigate('new-batch')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                        Continue →
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ key, label, icon, format, gradient, textColor }) => (
                    <div
                        key={key}
                        className={`bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/10`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-lg">{icon}</span>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${textColor}`}>
                            {stats[key] !== undefined ? format(stats[key]) : '—'}
                        </p>
                    </div>
                ))}
            </div>

            {/* Chart + Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scatter Chart — 2 cols */}
                <div className="lg:col-span-2">
                    <ScatterChart batches={scatterData} xKey="humidity" yKey="temperature" colorKey="quality" />
                </div>

                {/* Insights */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">🔍 Insights</h3>
                    <div className="space-y-3">
                        {insights.map((insight, i) => (
                            <div
                                key={i}
                                className={`rounded-xl p-3.5 text-xs leading-relaxed border ${insight.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    : insight.type === 'warning'
                                        ? 'bg-red-500/10 border-red-500/20 text-red-300'
                                        : insight.type === 'tip'
                                            ? 'bg-brand-500/10 border-brand-500/20 text-brand-300'
                                            : 'bg-white/5 border-white/10 text-gray-400'
                                    }`}
                            >
                                {insight.message}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Completed Batches */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-300">Recent Completed Batches</h3>
                    {completed.length > 5 && (
                        <button
                            onClick={() => onNavigate('history')}
                            className="text-xs text-brand-400 hover:text-brand-300 font-medium cursor-pointer"
                        >
                            View all →
                        </button>
                    )}
                </div>

                {recentBatches.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-sm">No completed batches yet.</p>
                        <button
                            onClick={() => onNavigate('new-batch')}
                            className="mt-3 text-brand-400 hover:text-brand-300 text-sm font-medium cursor-pointer"
                        >
                            Start your first batch →
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                    <th className="text-left py-3 px-3 font-semibold">Batch ID</th>
                                    <th className="text-left py-3 px-3 font-semibold">Date</th>
                                    <th className="text-right py-3 px-3 font-semibold">Loads</th>
                                    <th className="text-right py-3 px-3 font-semibold">Avg Temp</th>
                                    <th className="text-right py-3 px-3 font-semibold">Yield</th>
                                    <th className="text-left py-3 px-3 font-semibold">Quality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBatches.map(b => {
                                    const avgs = getBatchAverages(b);
                                    const yieldPct = b.plan.expectedQuantityKg > 0
                                        ? ((b.result.actualQuantityKg / b.plan.expectedQuantityKg) * 100).toFixed(1)
                                        : '—';
                                    return (
                                        <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-3 font-mono text-xs text-brand-400">{b.id}</td>
                                            <td className="py-3 px-3 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-3 text-right text-gray-300">{b.rawMaterials?.length || 0}</td>
                                            <td className="py-3 px-3 text-right text-gray-300">{avgs.avgTemperature.toFixed(1)}°C</td>
                                            <td className="py-3 px-3 text-right text-gray-300">{yieldPct}%</td>
                                            <td className="py-3 px-3"><QualityBadge quality={b.result.actualQuality} /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
