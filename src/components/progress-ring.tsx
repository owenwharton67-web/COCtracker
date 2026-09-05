// Pure SVG - no client JS needed, renders fine from a server component.
export function ProgressRing({
  percent,
  label,
  sublabel,
  size = 96,
  stroke = 9,
}: {
  percent: number;
  label: string;
  sublabel?: string;
  size?: number;
  stroke?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-text">{Math.round(clamped)}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-text">{label}</div>
        {sublabel && <div className="text-xs text-faint">{sublabel}</div>}
      </div>
    </div>
  );
}
