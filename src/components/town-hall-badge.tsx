// A distinctive Town Hall level badge - not game art (see category-icon.tsx
// for why), but a deliberate visual anchor for "this is my TH level" at a
// glance, styled like a tiered emblem rather than a plain stat tile.
export function TownHallBadge({ level, weaponLevel }: { level: number; weaponLevel?: number | null }) {
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full">
        <polygon
          points="32,2 59,17 59,47 32,62 5,47 5,17"
          fill="var(--color-accent-soft)"
          stroke="var(--color-accent)"
          strokeWidth="2"
        />
      </svg>
      <div className="relative text-center leading-none">
        <div className="text-[10px] font-semibold text-accent-strong tracking-wide">TH</div>
        <div className="text-xl font-bold text-text">{level}</div>
        {weaponLevel ? <div className="text-[9px] text-faint mt-0.5">wpn {weaponLevel}</div> : null}
      </div>
    </div>
  );
}
