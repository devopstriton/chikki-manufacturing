export function getCorrelationInsights(batches) {
    const completed = batches.filter(b => b.status === 'completed' && b.result);

    if (completed.length === 0) {
        return [{ type: 'info', message: 'Complete your first batch to see insights and optimal parameters.' }];
    }

    const insights = [];

    const avg = (arr, key) =>
        arr && arr.length > 0 ? arr.reduce((s, r) => s + Number(r[key]), 0) / arr.length : null;
    const sum = (arr, key) =>
        arr && arr.length > 0 ? arr.reduce((s, r) => s + Number(r[key]), 0) : 0;

    // Build analysis data for all completed batches
    const batchData = completed.map(b => {
        const avgHumidity = avg(b.rawMaterials, 'humidity');
        const avgTemp = avg(b.roastingReadings, 'temperature');
        const avgDensity = avg(b.jaggeryReadings, 'density');
        const avgViscosity = avg(b.jaggeryReadings, 'viscosity');
        const totalRawKg = sum(b.rawMaterials, 'weightKg');
        const totalJaggeryL = sum(b.jaggeryReadings, 'volumeLiters');
        const hasYield = b.plan?.expectedQuantityKg > 0;
        const yieldPct = hasYield
            ? (b.result.actualQuantityKg / b.plan.expectedQuantityKg) * 100
            : null;
        return {
            id: b.id,
            quality: b.result.actualQuality,
            avgHumidity,
            avgTemp,
            avgDensity,
            avgViscosity,
            totalRawKg,
            totalJaggeryL,
            yieldPct,
            hasYield,
            wastageKg: b.result.wastageKg,
            actualQty: b.result.actualQuantityKg,
        };
    });

    // ─── 1. OPTIMAL PARAMETER RANGES from best batches ───
    // Use yield-based ranking if available, otherwise quality-based
    const withYield = batchData.filter(b => b.hasYield);
    const bestBatches = withYield.length >= 2
        ? [...withYield].sort((a, b) => b.yieldPct - a.yieldPct).slice(0, Math.max(2, Math.ceil(withYield.length * 0.4)))
        : [...batchData].sort((a, b) => b.quality - a.quality).slice(0, Math.max(2, Math.ceil(batchData.length * 0.4)));

    const rankedBy = withYield.length >= 2 ? 'yield' : 'quality';

    // Compute optimal ranges from the best-performing batches
    const validVals = (arr, key) => arr.map(b => b[key]).filter(v => v !== null && v !== undefined && v > 0);

    const optHumidity = validVals(bestBatches, 'avgHumidity');
    const optTemp = validVals(bestBatches, 'avgTemp');
    const optDensity = validVals(bestBatches, 'avgDensity');
    const optViscosity = validVals(bestBatches, 'avgViscosity');

    const range = (arr) => arr.length > 0
        ? `${Math.min(...arr).toFixed(1)} – ${Math.max(...arr).toFixed(1)}`
        : '—';
    const singleOrRange = (arr, unit) => {
        if (arr.length === 0) return 'insufficient data';
        if (arr.length === 1) return `${arr[0].toFixed(1)}${unit}`;
        return `${Math.min(...arr).toFixed(1)} – ${Math.max(...arr).toFixed(1)}${unit}`;
    };

    // Build optimal parameters insight  
    const optParts = [];
    if (optHumidity.length > 0) optParts.push(`Humidity: ${singleOrRange(optHumidity, '%')}`);
    if (optTemp.length > 0) optParts.push(`Temperature: ${singleOrRange(optTemp, '°C')}`);
    if (optDensity.length > 0) optParts.push(`Jaggery Density: ${singleOrRange(optDensity, ' g/ml')}`);
    if (optViscosity.length > 0) optParts.push(`Viscosity: ${singleOrRange(optViscosity, ' cP')}`);

    if (optParts.length > 0) {
        insights.push({
            type: 'success',
            message: `🎯 Optimal Parameters (from top ${rankedBy} batches): ${optParts.join(' · ')}`,
        });
    }

    // ─── 2. BEST BATCH reference ───
    const best = withYield.length > 0
        ? withYield.reduce((a, b) => (b.yieldPct > a.yieldPct ? b : a))
        : batchData.reduce((a, b) => (b.quality > a.quality ? b : a));

    const bestParts = [];
    if (best.avgHumidity !== null) bestParts.push(`Humidity ${best.avgHumidity.toFixed(1)}%`);
    if (best.avgTemp !== null) bestParts.push(`Temp ${best.avgTemp.toFixed(1)}°C`);
    if (best.avgDensity !== null) bestParts.push(`Density ${best.avgDensity.toFixed(2)} g/ml`);

    insights.push({
        type: 'tip',
        message: `🏆 Best batch (${best.id}): ${best.hasYield ? `yield ${best.yieldPct.toFixed(1)}%` : `quality ${best.quality}/10`}${bestParts.length > 0 ? ` — ${bestParts.join(', ')}` : ''}`,
    });

    // ─── 3. YIELD ANALYSIS (if enough yield data) ───
    if (withYield.length >= 2) {
        const avgYield = withYield.reduce((s, b) => s + b.yieldPct, 0) / withYield.length;
        insights.push({
            type: avgYield >= 90 ? 'success' : avgYield >= 75 ? 'info' : 'warning',
            message: `Average yield: ${avgYield.toFixed(1)}% across ${withYield.length} batches ${avgYield >= 90 ? '(excellent)' : avgYield >= 75 ? '(good)' : '(needs improvement)'}`,
        });
    }

    // ─── 4. CORRELATION ANALYSIS (with 5+ yield-bearing batches) ───
    if (withYield.length >= 5) {
        const yields = withYield.map(b => b.yieldPct);

        const correlations = [
            { name: 'Humidity', values: withYield.map(b => b.avgHumidity) },
            { name: 'Temperature', values: withYield.map(b => b.avgTemp) },
            { name: 'Density', values: withYield.map(b => b.avgDensity) },
            { name: 'Raw Material (kg)', values: withYield.map(b => b.totalRawKg) },
            { name: 'Jaggery Vol (L)', values: withYield.map(b => b.totalJaggeryL) },
        ]
            .filter(c => c.values.every(v => v !== null && v !== undefined))
            .map(c => ({ ...c, r: pearsonCorrelation(c.values, yields) }))
            .filter(c => !isNaN(c.r));

        const desc = (r) => {
            const abs = Math.abs(r);
            if (abs > 0.7) return 'strong';
            if (abs > 0.4) return 'moderate';
            return 'weak';
        };

        const sorted = [...correlations].sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
        if (sorted.length > 0 && Math.abs(sorted[0].r) > 0.3) {
            const top = sorted[0];
            const direction = top.r > 0 ? 'higher' : 'lower';
            insights.push({
                type: 'tip',
                message: `📊 Strongest yield driver: ${top.name} — ${desc(top.r)} correlation (${top.r.toFixed(2)}). ${direction.charAt(0).toUpperCase() + direction.slice(1)} ${top.name.toLowerCase()} tends to produce better yields.`,
            });
        }

        const corrSummary = correlations.map(c => `${c.name}: ${c.r.toFixed(2)}`).join(', ');
        insights.push({
            type: 'info',
            message: `Yield correlations — ${corrSummary}`,
        });
    } else if (withYield.length < 5 && withYield.length >= 1) {
        insights.push({
            type: 'info',
            message: `Complete ${5 - withYield.length} more batch${5 - withYield.length > 1 ? 'es' : ''} with expected quantities to unlock full correlation analysis.`,
        });
    }

    // ─── 5. WASTAGE INSIGHT ───
    const withWaste = batchData.filter(b => b.wastageKg > 0 && b.hasYield);
    if (withWaste.length > 0) {
        const avgWaste = withWaste.reduce((s, b) => s + b.wastageKg, 0) / withWaste.length;
        insights.push({
            type: avgWaste > 3 ? 'warning' : 'info',
            message: `Average wastage: ${avgWaste.toFixed(1)} kg/batch${avgWaste > 3 ? ' — consider optimizing to reduce waste below 3 kg.' : ' (within acceptable range).'}`,
        });
    }

    return insights;
}

function pearsonCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
    const sumX2 = x.reduce((a, xi) => a + xi * xi, 0);
    const sumY2 = y.reduce((a, yi) => a + yi * yi, 0);
    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return den === 0 ? 0 : num / den;
}

export function exportToCSV(batches) {
    const completed = batches.filter(b => b.status === 'completed' && b.result);
    const headers = [
        'Batch ID', 'Date', 'Expected Quality', 'Expected Qty (kg)',
        'Raw Loads', 'Avg Humidity (%)', 'Total Raw Weight (kg)',
        'Roasting Readings', 'Avg Temp (°C)',
        'Jaggery Readings', 'Avg Density (g/ml)', 'Avg Viscosity (cP)', 'Total Jaggery (L)',
        'Actual Quality', 'Actual Qty (kg)', 'Wastage (kg)', 'Yield %', 'Notes'
    ];

    const avg = (arr, key) =>
        arr && arr.length > 0 ? (arr.reduce((s, r) => s + Number(r[key]), 0) / arr.length).toFixed(2) : '—';

    const rows = completed.map(b => [
        b.id,
        new Date(b.createdAt).toLocaleDateString(),
        b.plan.expectedQuality,
        b.plan.expectedQuantityKg,
        b.rawMaterials.length,
        avg(b.rawMaterials, 'humidity'),
        b.rawMaterials.reduce((s, r) => s + Number(r.weightKg), 0).toFixed(1),
        b.roastingReadings.length,
        avg(b.roastingReadings, 'temperature'),
        b.jaggeryReadings.length,
        avg(b.jaggeryReadings, 'density'),
        avg(b.jaggeryReadings, 'viscosity'),
        b.jaggeryReadings.reduce((s, r) => s + Number(r.volumeLiters), 0).toFixed(1),
        b.result.actualQuality,
        b.result.actualQuantityKg,
        b.result.wastageKg,
        b.plan.expectedQuantityKg > 0
            ? ((b.result.actualQuantityKg / b.plan.expectedQuantityKg) * 100).toFixed(1) + '%'
            : '—',
        `"${(b.result.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chikki_batches_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
