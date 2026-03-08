export default function QualityBadge({ quality }) {
    const q = Number(quality);
    let colorClasses, label;

    if (q >= 8) {
        colorClasses = 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30';
        label = 'Excellent';
    } else if (q >= 5) {
        colorClasses = 'bg-amber-500/20 text-amber-400 ring-amber-500/30';
        label = 'Good';
    } else {
        colorClasses = 'bg-red-500/20 text-red-400 ring-red-500/30';
        label = 'Poor';
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${colorClasses}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${q >= 8 ? 'bg-emerald-400' : q >= 5 ? 'bg-amber-400' : 'bg-red-400'}`} />
            {q}/10 · {label}
        </span>
    );
}
