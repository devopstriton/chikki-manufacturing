import { useState } from 'react';

export default function RoastingStage({ batch, onAdd }) {
    const [temperature, setTemperature] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        if (!temperature || Number(temperature) < 50 || Number(temperature) > 300) {
            setError('50-300°C'); return;
        }
        onAdd({ temperature });
        setTemperature('');
        setError('');
    };

    const readings = batch.roastingReadings || [];

    const inputClass = "w-full bg-white/5 border border-white/10 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 rounded-xl px-3 py-2.5 lg:px-4 lg:py-3 text-white text-sm placeholder-gray-500 outline-none transition-all";

    return (
        <div className="space-y-3 lg:space-y-6">
            {/* Input — inline with button */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    🌡️ Record Roasting Temperature
                </h3>
                <div className="flex gap-2 lg:gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Temperature <span className="text-brand-400">(°C)</span>
                        </label>
                        <input
                            type="number" step="1" placeholder="160"
                            value={temperature} onChange={e => setTemperature(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="shrink-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold text-xs lg:text-sm py-2.5 lg:py-3 px-4 lg:px-5 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 cursor-pointer"
                    >
                        + Record
                    </button>
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            {/* Readings list */}
            {readings.length > 0 && (
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 lg:px-5 py-3 border-b border-white/5">
                        <h4 className="text-xs lg:text-sm font-semibold text-gray-300">
                            Readings ({readings.length})
                        </h4>
                    </div>
                    {/* Mobile: compact list */}
                    <div className="lg:hidden">
                        {readings.map((r, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.03] text-xs">
                                <span className="text-gray-500">#{i + 1}</span>
                                <span className="text-gray-300 font-medium">{r.temperature}°C</span>
                                <span className="text-gray-500 text-[10px]">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                    </div>
                    {/* Desktop: full table */}
                    <table className="hidden lg:table w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider bg-white/[0.02]">
                                <th className="text-left py-3 px-5 font-semibold">#</th>
                                <th className="text-right py-3 px-5 font-semibold">Temperature (°C)</th>
                                <th className="text-right py-3 px-5 font-semibold">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readings.map((r, i) => (
                                <tr key={i} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                                    <td className="py-3 px-5 text-gray-500">{i + 1}</td>
                                    <td className="py-3 px-5 text-right text-gray-300 font-medium">{r.temperature}°C</td>
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
                    No readings yet. Start measuring temperature.
                </div>
            )}
        </div>
    );
}
