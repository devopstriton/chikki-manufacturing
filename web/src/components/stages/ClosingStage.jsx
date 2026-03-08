import { useState } from 'react';

export default function ClosingStage({ batch, onComplete }) {
    const [actualQuality, setActualQuality] = useState('');
    const [actualQuantityKg, setActualQuantityKg] = useState('');
    const [wastageKg, setWastageKg] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState({});

    const expectedQ = batch.plan?.expectedQuality || 0;
    const expectedQty = batch.plan?.expectedQuantityKg || 0;
    const totalRawWeight = (batch.rawMaterials || []).reduce((s, r) => s + r.weightKg, 0);

    const validate = () => {
        const errs = {};
        if (!actualQuality || Number(actualQuality) < 1 || Number(actualQuality) > 10)
            errs.quality = 'Rate quality 1-10';
        if (!actualQuantityKg || Number(actualQuantityKg) <= 0)
            errs.quantity = 'Enter actual quantity';
        if (!wastageKg || Number(wastageKg) < 0)
            errs.wastage = 'Enter wastage (0 if none)';
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        onComplete({ actualQuality, actualQuantityKg, wastageKg, notes });
    };

    const yieldPct = actualQuantityKg && expectedQty > 0
        ? ((Number(actualQuantityKg) / expectedQty) * 100).toFixed(1)
        : null;
    const wastePct = wastageKg && totalRawWeight > 0
        ? ((Number(wastageKg) / totalRawWeight) * 100).toFixed(1)
        : null;

    const inputClass = (field) =>
        `w-full bg-white/5 border ${errors[field] ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-white/10 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20'} rounded-xl px-3 py-2.5 lg:px-4 lg:py-3 text-white text-sm placeholder-gray-500 outline-none transition-all`;

    return (
        <div className="space-y-3 lg:space-y-6">
            {/* Summary of batch so far */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-gray-300 mb-3 lg:mb-4">📋 Batch Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4">
                    {/* Raw Material Summary */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 lg:p-4">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">🥜 Raw Material</p>
                        <p className="text-lg font-bold text-brand-400">{totalRawWeight.toFixed(1)} kg</p>
                        <div className="mt-1.5 space-y-0.5 text-xs text-gray-400">
                            <p>{batch.rawMaterials?.length || 0} loads · Avg Humidity{' '}
                                <span className="text-sky-400 font-semibold">
                                    {(batch.rawMaterials?.length > 0
                                        ? (batch.rawMaterials.reduce((s, r) => s + r.humidity, 0) / batch.rawMaterials.length).toFixed(1)
                                        : '—')}%
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Roasting Summary */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">🌡️ Roasting</p>
                        {batch.roastingReadings?.length > 0 ? (() => {
                            const temps = batch.roastingReadings.map(r => r.temperature);
                            const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
                            return (
                                <>
                                    <p className="text-lg font-bold text-orange-400">{avg}°C <span className="text-xs text-gray-500 font-normal">avg</span></p>
                                    <div className="mt-1.5 space-y-0.5 text-xs text-gray-400">
                                        <p>{temps.length} readings · <span className="text-sky-400">{Math.min(...temps)}°C</span> – <span className="text-red-400">{Math.max(...temps)}°C</span></p>
                                    </div>
                                </>
                            );
                        })() : (
                            <p className="text-lg font-bold text-gray-600">—</p>
                        )}
                    </div>

                    {/* Jaggery Summary */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">🍯 Jaggery Syrup</p>
                        {batch.jaggeryReadings?.length > 0 ? (() => {
                            const r = batch.jaggeryReadings;
                            const totalVol = r.reduce((s, x) => s + x.volumeLiters, 0);
                            const avgD = (r.reduce((s, x) => s + x.density, 0) / r.length).toFixed(2);
                            const avgV = (r.reduce((s, x) => s + x.viscosity, 0) / r.length).toFixed(0);
                            return (
                                <>
                                    <p className="text-lg font-bold text-amber-400">{totalVol.toFixed(1)} L</p>
                                    <div className="mt-1.5 space-y-0.5 text-xs text-gray-400">
                                        <p>{r.length} readings · Density <span className="text-amber-400 font-semibold">{avgD}</span> · Viscosity <span className="text-purple-400 font-semibold">{avgV} cP</span></p>
                                    </div>
                                </>
                            );
                        })() : (
                            <p className="text-lg font-bold text-gray-600">—</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Expected vs Planned */}
            <div className="grid grid-cols-2 gap-2 lg:gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 lg:p-5">
                    <p className="text-[9px] lg:text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Expected Quality</p>
                    <p className="text-2xl lg:text-3xl font-extrabold text-white">{expectedQ}<span className="text-sm lg:text-lg text-gray-400">/10</span></p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 lg:p-5">
                    <p className="text-[9px] lg:text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Expected Quantity</p>
                    <p className="text-2xl lg:text-3xl font-extrabold text-white">{expectedQty} <span className="text-sm lg:text-lg text-gray-400">kg</span></p>
                </div>
            </div>

            {/* Actuals form */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-gray-300 mb-3">✅ Enter Actual Results</h3>
                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                    <div>
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Quality <span className="text-brand-400">(1-10)</span>
                        </label>
                        <input
                            type="number" min="1" max="10" step="1"
                            placeholder="e.g. 8" value={actualQuality}
                            onChange={e => { setActualQuality(e.target.value); setErrors(p => ({ ...p, quality: undefined })); }}
                            className={inputClass('quality')}
                        />
                        {errors.quality && <p className="text-red-400 text-xs mt-1">{errors.quality}</p>}
                        {actualQuality && (
                            <div className="mt-2 flex gap-0.5">
                                {Array.from({ length: 10 }, (_, i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < Number(actualQuality)
                                        ? Number(actualQuality) >= 8 ? 'bg-emerald-400' : Number(actualQuality) >= 5 ? 'bg-amber-400' : 'bg-red-400'
                                        : 'bg-white/10'
                                        }`} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Quantity <span className="text-brand-400">(kg)</span>
                        </label>
                        <input
                            type="number" step="0.1"
                            placeholder="e.g. 48.5" value={actualQuantityKg}
                            onChange={e => { setActualQuantityKg(e.target.value); setErrors(p => ({ ...p, quantity: undefined })); }}
                            className={inputClass('quantity')}
                        />
                        {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
                        {yieldPct && (
                            <p className="text-xs text-gray-400 mt-1.5">
                                Yield: <span className={`font-bold ${Number(yieldPct) >= 90 ? 'text-emerald-400' : Number(yieldPct) >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{yieldPct}%</span>
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                            Wastage <span className="text-brand-400">(kg)</span>
                        </label>
                        <input
                            type="number" step="0.1" min="0"
                            placeholder="e.g. 2.0" value={wastageKg}
                            onChange={e => { setWastageKg(e.target.value); setErrors(p => ({ ...p, wastage: undefined })); }}
                            className={inputClass('wastage')}
                        />
                        {errors.wastage && <p className="text-red-400 text-xs mt-1">{errors.wastage}</p>}
                        {wastePct && (
                            <p className="text-xs text-gray-400 mt-1.5">
                                Waste: <span className={`font-bold ${Number(wastePct) <= 5 ? 'text-emerald-400' : Number(wastePct) <= 10 ? 'text-amber-400' : 'text-red-400'}`}>{wastePct}%</span> of raw
                            </p>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-3">
                    <label className="block text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">
                        📝 Notes (optional)
                    </label>
                    <textarea
                        rows="3" placeholder="Any observations about this batch..."
                        value={notes} onChange={e => setNotes(e.target.value)}
                        className={`${inputClass('notes')} resize-none`}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-3 lg:mt-5 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs lg:text-sm py-3 lg:py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 cursor-pointer"
                >
                    ✅ Close Batch
                </button>
            </div>
        </div>
    );
}
