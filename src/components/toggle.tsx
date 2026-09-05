// A checkbox styled as an iOS-style switch. Still a real checkbox input
// (name/defaultChecked work exactly like any form checkbox) so it needs no
// client JS - just CSS via the peer-checked selector.
export function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-4 py-2 cursor-pointer group">
      <span>
        <span className="text-sm text-text">{label}</span>
        {description && <span className="block text-xs text-faint mt-0.5">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-surface-2 border border-border-strong transition-colors peer-checked:bg-accent peer-checked:border-accent" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-faint transition-all peer-checked:translate-x-5 peer-checked:bg-on-accent" />
      </span>
    </label>
  );
}
