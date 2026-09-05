// Minimal inline SVG sparkline - no charting library needed for a single
// trend line. Server-renderable.
export function Sparkline({
  values,
  width = 240,
  height = 56,
  label,
  currentLabel,
}: {
  values: number[];
  width?: number;
  height?: number;
  label: string;
  currentLabel: string;
}) {
  if (values.length < 2) {
    return (
      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <div className="text-xs text-faint">{label}</div>
        <div className="text-sm text-muted mt-2">Not enough history yet</div>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 4;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return [x, y] as const;
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${height} L${points[0][0].toFixed(1)},${height} Z`;

  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const trendColor = delta > 0 ? "var(--color-success)" : delta < 0 ? "var(--color-danger)" : "var(--color-faint)";

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-faint">{label}</span>
        {delta !== 0 && (
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {delta > 0 ? "+" : ""}
            {delta.toLocaleString()}
          </span>
        )}
      </div>
      <div className="text-lg font-semibold text-text mt-0.5">{currentLabel}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full mt-2" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sparkline-fill-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#sparkline-fill-${label})`} />
        <path d={linePath} fill="none" stroke={trendColor} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}
