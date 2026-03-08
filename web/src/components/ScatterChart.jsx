import { useRef, useEffect } from 'react';

export default function ScatterChart({ batches, xKey = 'humidity', yKey = 'temperature', colorKey = 'quality' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const pad = { top: 30, right: 30, bottom: 50, left: 60 };
        const plotW = w - pad.left - pad.right;
        const plotH = h - pad.top - pad.bottom;

        // Clear
        ctx.clearRect(0, 0, w, h);

        if (batches.length === 0) {
            ctx.fillStyle = 'rgba(156,163,175,0.5)';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Add batches to see correlations', w / 2, h / 2);
            return;
        }

        const xVals = batches.map(b => Number(b[xKey]));
        const yVals = batches.map(b => Number(b[yKey]));
        const cVals = batches.map(b => Number(b[colorKey]));

        const xMin = Math.min(...xVals) - 1;
        const xMax = Math.max(...xVals) + 1;
        const yMin = Math.min(...yVals) - 5;
        const yMax = Math.max(...yVals) + 5;

        const toX = v => pad.left + ((v - xMin) / (xMax - xMin)) * plotW;
        const toY = v => pad.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + (plotH / 5) * i;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(w - pad.right, y);
            ctx.stroke();

            const x = pad.left + (plotW / 5) * i;
            ctx.beginPath();
            ctx.moveTo(x, pad.top);
            ctx.lineTo(x, h - pad.bottom);
            ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = 'rgba(156,163,175,0.6)';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';

        for (let i = 0; i <= 5; i++) {
            const xVal = xMin + ((xMax - xMin) / 5) * i;
            ctx.fillText(xVal.toFixed(1), pad.left + (plotW / 5) * i, h - pad.bottom + 20);
        }

        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const yVal = yMin + ((yMax - yMin) / 5) * i;
            ctx.fillText(yVal.toFixed(0), pad.left - 10, pad.top + plotH - (plotH / 5) * i + 4);
        }

        // Axis titles
        ctx.fillStyle = 'rgba(251,191,36,0.7)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';

        const labels = {
            humidity: 'Humidity (%)',
            temperature: 'Temperature (°C)',
            density: 'Density (g/ml)',
            quality: 'Quality (1-10)',
        };

        ctx.fillText(labels[xKey] || xKey, w / 2, h - 8);

        ctx.save();
        ctx.translate(15, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(labels[yKey] || yKey, 0, 0);
        ctx.restore();

        // Data points with glow
        batches.forEach((b, i) => {
            const x = toX(xVals[i]);
            const y = toY(yVals[i]);
            const q = cVals[i];

            let color;
            if (q >= 8) color = { r: 34, g: 197, b: 94 };
            else if (q >= 5) color = { r: 245, g: 158, b: 11 };
            else color = { r: 239, g: 68, b: 68 };

            // Glow
            const glow = ctx.createRadialGradient(x, y, 0, x, y, 20);
            glow.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0.3)`);
            glow.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();

            // Point
            ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},0.9)`;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.4)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Legend
        const legendItems = [
            { label: 'Excellent (8-10)', color: 'rgba(34,197,94,0.9)' },
            { label: 'Good (5-7)', color: 'rgba(245,158,11,0.9)' },
            { label: 'Poor (1-4)', color: 'rgba(239,68,68,0.9)' },
        ];

        let lx = w - pad.right - 120;
        let ly = pad.top + 5;
        ctx.font = '10px Inter, sans-serif';
        legendItems.forEach(({ label, color }) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(lx, ly, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(156,163,175,0.7)';
            ctx.textAlign = 'left';
            ctx.fillText(label, lx + 10, ly + 3);
            ly += 16;
        });

    }, [batches, xKey, yKey, colorKey]);

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Parameter Correlation</h3>
            <canvas
                ref={canvasRef}
                className="w-full h-64 rounded-xl"
                style={{ width: '100%', height: '260px' }}
            />
        </div>
    );
}
