import { useState } from 'react';

export default function RawMaterialStage({ batch, onAdd }) {
    const [weightKg, setWeightKg] = useState('');
    const [humidity, setHumidity] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        if (!weightKg || Number(weightKg) <= 0) { setError('Enter valid weight'); return; }
        if (!humidity || Number(humidity) < 0 || Number(humidity) > 100) { setError('Humidity must be 0-100%'); return; }
        onAdd({ weightKg, humidity });
        setWeightKg('');
        setHumidity('');
        setError('');
    };

    const loads = batch.rawMaterials || [];
    const totalWeight = loads.reduce((s, r) => s + r.weightKg, 0);
    const avgHumidity = loads.length > 0 ? (loads.reduce((s, r) => s + r.humidity, 0) / loads.length).toFixed(1) : '—';

    const inputClass = "w-full bg-white/5 border border-white/10 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 rounded-xl px-3 py-2.5 lg:px-4 lg:py-3 text-white text-sm placeholder-gray-500 outline-none transition-all";

    return (
        <div className="space-y-3 lg:space-y-6">
            {/* Input form — compact and inline on mobile */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    🥜 Add Raw Material Load
                </h3>
                <div className="flex gap-2 lg:gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Weight <span className="text-brand-400">(kg)</span>
                        </label>
                        <input
                            type="number" step="0.1" placeholder="12.5"
                            value={weightKg} onChange={e => setWeightKg(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Humidity <span className="text-brand-400">(% RH)</span>
                        </label>
                        <input
                            type="number" step="0.1" placeholder="11.5"
                            value={humidity} onChange={e => setHumidity(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="shrink-0 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold text-xs lg:text-sm py-2.5 lg:py-3 px-4 lg:px-5 rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:-translate-y-0.5 cursor-pointer"
                    >
                        + Add
                    </button>
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            {/* Recorded loads table */}
            {loads.length > 0 && (
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 lg:px-5 py-3 border-b border-white/5 flex items-center justify-between">
                        <h4 className="text-xs lg:text-sm font-semibold text-gray-300">
                            Loads ({loads.length})
                        </h4>
                        <div className="flex gap-3 text-[10px] lg:text-xs">
                            <span className="text-gray-400">Total: <span className="text-brand-400 font-bold">{totalWeight.toFixed(1)} kg</span></span>
                            <span className="text-gray-400">Avg: <span className="text-sky-400 font-bold">{avgHumidity}%</span></span>
                        </div>
                    </div>
                    {/* Mobile: simplified list. Desktop: full table */}
                    <div className="lg:hidden">
                        {loads.map((l, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.03] text-xs">
                                <span className="text-gray-500">#{i + 1}</span>
                                <span className="text-gray-300 font-medium">{l.weightKg} kg</span>
                                <span className="text-gray-400">{l.humidity}%</span>
                                <span className="text-gray-500 text-[10px]">{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                    </div>
                    <table className="hidden lg:table w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider bg-white/[0.02]">
                                <th className="text-left py-3 px-5 font-semibold">#</th>
                                <th className="text-right py-3 px-5 font-semibold">Weight (kg)</th>
                                <th className="text-right py-3 px-5 font-semibold">Humidity (%)</th>
                                <th className="text-right py-3 px-5 font-semibold">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loads.map((l, i) => (
                                <tr key={i} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                                    <td className="py-3 px-5 text-gray-500">{i + 1}</td>
                                    <td className="py-3 px-5 text-right text-gray-300 font-medium">{l.weightKg} kg</td>
                                    <td className="py-3 px-5 text-right text-gray-300">{l.humidity}%</td>
                                    <td className="py-3 px-5 text-right text-gray-500 text-xs">
                                        {new Date(l.timestamp).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {loads.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-xs lg:text-sm">
                    No loads recorded yet. Add raw material above.
                </div>
            )}
        </div>
    );
}
