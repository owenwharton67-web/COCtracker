// Shared style primitives - the dark theme's tokens live in globals.css
// (bg/surface/border/text/accent/currency colors). Compose from these
// instead of writing fresh Tailwind strings per file.

export const cardClasses = "rounded-2xl border border-border bg-surface p-5";

export const cardHeaderClasses = "text-sm font-semibold text-text mb-1";
export const cardSubtextClasses = "text-sm text-muted";

export const inputClasses =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-faint outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

export const selectClasses = inputClasses + " appearance-none";

export const buttonClasses =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent text-on-accent px-4 py-2 text-sm font-semibold hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

export const secondaryButtonClasses =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-strong bg-surface-2 text-text px-4 py-2 text-sm font-medium hover:bg-surface-hover transition-colors";

export const ghostButtonClasses =
  "inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-text hover:bg-surface-hover transition-colors";

export const dangerLinkClasses = "text-xs font-medium text-danger hover:underline";

export const labelClasses = "block text-xs font-medium text-muted mb-1.5";

export const pageHeaderTitleClasses = "text-2xl font-semibold text-text tracking-tight";
export const pageHeaderSubtextClasses = "text-sm text-muted mt-1 max-w-2xl";

export const sectionLabelClasses = "text-xs font-semibold uppercase tracking-wide text-faint";

// Currency badges - matches the in-game color language so it's scannable
// at a glance in the upgrade plan.
export const currencyBadgeClasses: Record<string, string> = {
  GOLD: "bg-gold-soft text-gold",
  ELIXIR: "bg-elixir-soft text-elixir",
  DARK_ELIXIR: "bg-dark-elixir-soft text-dark-elixir",
  ORE: "bg-ore-soft text-ore",
};

export function badgeClasses(tone: "neutral" | "accent" | "success" | "danger" = "neutral"): string {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium";
  switch (tone) {
    case "accent":
      return `${base} bg-accent-soft text-accent-strong`;
    case "success":
      return `${base} bg-success-soft text-success`;
    case "danger":
      return `${base} bg-danger-soft text-danger`;
    default:
      return `${base} bg-surface-2 text-muted border border-border`;
  }
}

export const statTileClasses = "rounded-xl border border-border bg-surface-2 p-4";
export const statTileLabelClasses = "text-xs text-faint";
export const statTileValueClasses = "text-lg font-semibold text-text mt-0.5";

export const dividerClasses = "border-t border-border";

export const emptyStateClasses = "text-sm text-faint py-6 text-center";
