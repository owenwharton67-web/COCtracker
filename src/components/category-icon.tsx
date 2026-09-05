// Custom glyph set for unit/building categories - deliberately NOT Clash of
// Clans game art. There's no reliable, licensed source of real game sprites
// to hotlink (checked - scattered personal repos with unpredictable
// filenames, which would just mean broken images), so this is a clean,
// consistent icon language purpose-built for this dashboard instead.
import type { BuildingGroup } from "@/data/building-catalog";

export type IconKind =
  | "HERO"
  | "HERO_EQUIPMENT"
  | "TROOP"
  | "SIEGE_MACHINE"
  | "SPELL"
  | "PET"
  | "BUILDING"
  | BuildingGroup;

const PATHS: Record<IconKind, string> = {
  // crown
  HERO: "M4 18h16l-1.5-9-4 3-2.5-5-2.5 5-4-3L4 18zM4 20h16",
  // shield with a sparkle
  HERO_EQUIPMENT: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  // crossed swords
  TROOP: "M4 20l7-7M20 4l-7 7M4 4l16 16M9 15l-2 5-3-3 5-2zM15 9l2-5 3 3-5 2z",
  // wheeled siege vehicle
  SIEGE_MACHINE: "M4 16h16M6 16v-4h12v4M8 8h8l2 4H6l2-4zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  // sparkle / potion
  SPELL: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z",
  // paw
  PET: "M7 14c-1.5 0-2.5 1.3-2.5 3S5.5 20 7 20s2.5-1.3 2.5-3S8.5 14 7 14zM17 14c1.5 0 2.5 1.3 2.5 3S18.5 20 17 20s-2.5-1.3-2.5-3 1-3 2.5-3zM9.5 9c-1.2 0-2 1.1-2 2.5s.8 2.5 2 2.5 2-1.1 2-2.5S10.7 9 9.5 9zM14.5 9c1.2 0 2 1.1 2 2.5s-.8 2.5-2 2.5-2-1.1-2-2.5S13.3 9 14.5 9zM12 12c-2 0-4 2-4 4.5S9.5 21 12 21s4-2 4-4.5S14 12 12 12z",
  // generic building (used when the specific group isn't known - e.g. in
  // the upgrade plan, where a candidate only carries "BUILDING"/"WALL")
  BUILDING: "M4 21V9l8-5 8 5v12M9 21v-6h6v6M4 21h16",
  // coin/droplet stack (resources)
  RESOURCE: "M12 4c4 0 7 1.3 7 3s-3 3-7 3-7-1.3-7-3 3-3 7-3zM5 7v10c0 1.7 3 3 7 3s7-1.3 7-3V7M5 12c0 1.7 3 3 7 3s7-1.3 7-3",
  // tent (army)
  ARMY: "M12 4l9 14H3l9-14zM8 18l4-7 4 7",
  // tower/shield (defense)
  DEFENSE: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3zM12 8v6",
  // spike/mine (trap)
  TRAP: "M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M12 8a4 4 0 100 8 4 4 0 000-8z",
  // brick wall
  WALL: "M3 6h6v4H3zM9 6h6v4H9zM15 6h6v4h-6zM6 10h6v4H6zM12 10h6v4h-6zM3 14h6v4H3zM9 14h6v4H9zM15 14h6v4h-6z",
  OTHER: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v4l3 3",
};

export function CategoryIcon({ kind, className = "h-4 w-4" }: { kind: IconKind | string; className?: string }) {
  const d = PATHS[kind as IconKind] ?? PATHS.OTHER;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}
