import { useState } from 'react';

export default function JaggeryStage({ batch, onAdd }) {
    const [volumeLiters, setVolumeLiters] = useState('');
    const [density, setDensity] = useState('');
    const [viscosity, setViscosity] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        if (!volumeLiters || Number(volumeLiters) <= 0) { setError('Enter volume'); return; }
        if (!density || Number(density) < 0.5 || Number(density) > 3) { setError('Density 0.5-3.0'); return; }
        if (!viscosity || Number(viscosity) <= 0) { setError('Enter viscosity'); return; }
        onAdd({ volumeLiters, density, viscosity });
        setVolumeLiters('');
        setDensity('');
        setViscosity('');
        setError('');
    };

    const readings = batch.jaggeryReadings || [];
    const totalVol = readings.reduce((s, r) => s + r.volumeLiters, 0);

    const inputClass = "w-full bg-white/5 border border-white/10 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 rounded-xl px-3 py-2.5 lg:px-4 lg:py-3 text-white text-sm placeholder-gray-500 outline-none transition-all";

    return (
        <div className="space-y-3 lg:space-y-6">
            {/* Input form — 3 fields + button in row */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    🍯 Add Jaggery Syrup Measurement
                </h3>
                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                    <div>
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Volume <span className="text-brand-400">(L)</span>
                        </label>
                        <input
                            type="number" step="0.1" placeholder="5.0"
                            value={volumeLiters} onChange={e => setVolumeLiters(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Density <span className="text-brand-400">(g/ml)</span>
                        </label>
                        <input
                            type="number" step="0.01" placeholder="1.35"
                            value={density} onChange={e => setDensity(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Viscosity <span className="text-brand-400">(cP)</span>
                        </label>
                        <input
                            type="number" step="1" placeholder="450"
                            value={viscosity} onChange={e => setViscosity(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                <button
                    onClick={handleAdd}
                    className="mt-3 w-full lg:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold text-xs lg:text-sm py-2.5 lg:py-3 px-4 lg:px-5 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 cursor-pointer"
                >
                    + Add Reading
                </button>
            </div>

            {/* Readings table */}
            {readings.length > 0 && (
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 lg:px-5 py-3 border-b border-white/5">
                        <h4 className="text-xs lg:text-sm font-semibold text-gray-300">
                            Readings ({readings.length}) · Total: {totalVol.toFixed(1)} L
                        </h4>
                    </div>
                    {/* Mobile: compact list */}
                    <div className="lg:hidden">
                        {readings.map((r, i) => (
                            <div key={i} className="px-4 py-2.5 border-t border-white/[0.03] text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">#{i + 1}</span>
                                    <span className="text-gray-300 font-medium">{r.volumeLiters} L</span>
                                    <span className="text-gray-400">{r.density} g/ml</span>
                                    <span className="text-gray-400">{r.viscosity} cP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop: full table */}
                    <table className="hidden lg:table w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider bg-white/[0.02]">
                                <th className="text-left py-3 px-5 font-semibold">#</th>
                                <th className="text-right py-3 px-5 font-semibold">Volume (L)</th>
                                <th className="text-right py-3 px-5 font-semibold">Density (g/ml)</th>
                                <th className="text-right py-3 px-5 font-semibold">Viscosity (cP)</th>
                                <th className="text-right py-3 px-5 font-semibold">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readings.map((r, i) => (
                                <tr key={i} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                                    <td className="py-3 px-5 text-gray-500">{i + 1}</td>
                                    <td className="py-3 px-5 text-right text-gray-300 font-medium">{r.volumeLiters} L</td>
                                    <td className="py-3 px-5 text-right text-gray-300">{r.density} g/ml</td>
                                    <td className="py-3 px-5 text-right text-gray-300">{r.viscosity} cP</td>
                                    <td className="py-3 px-5 text-right text-gray-500 text-xs">
                                        {new Date(r.timestamp).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {readings.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-xs lg:text-sm">
                    No readings yet. Measure jaggery syrup above.
                </div>
            )}
        </div>
    );
}
