// Building types offered in the manual-entry UI, grouped for display and
// tagged with the strategic weight the optimizer's heuristic uses (see
// src/lib/optimizer/heuristic.ts). Deliberately NOT paired with a max-level-
// per-Town-Hall table - see the capLevel comment on BuildingInstance in
// schema.prisma for why.

export type BuildingGroup = "RESOURCE" | "ARMY" | "DEFENSE" | "TRAP" | "WALL" | "OTHER";

export interface BuildingCatalogEntry {
  name: string;
  group: BuildingGroup;
  // Relative strategic priority within its group when nothing else
  // distinguishes two candidates (higher = do sooner). See heuristic.ts.
  weight: number;
}

export const BUILDING_CATALOG: BuildingCatalogEntry[] = [
  // Resource buildings compound - every hour they're not maxed is income lost.
  { name: "Gold Mine", group: "RESOURCE", weight: 9 },
  { name: "Elixir Collector", group: "RESOURCE", weight: 9 },
  { name: "Dark Elixir Drill", group: "RESOURCE", weight: 9 },
  { name: "Gold Storage", group: "RESOURCE", weight: 7 },
  { name: "Elixir Storage", group: "RESOURCE", weight: 7 },
  { name: "Dark Elixir Storage", group: "RESOURCE", weight: 7 },

  // Army buildings unlock everything else (stronger troops, more army camp
  // space) - high leverage even though they don't defend or produce.
  { name: "Laboratory", group: "ARMY", weight: 10 },
  { name: "Army Camp", group: "ARMY", weight: 8 },
  { name: "Barracks", group: "ARMY", weight: 6 },
  { name: "Dark Barracks", group: "ARMY", weight: 6 },
  { name: "Spell Factory", group: "ARMY", weight: 6 },
  { name: "Dark Spell Factory", group: "ARMY", weight: 6 },
  { name: "Workshop", group: "ARMY", weight: 5 },
  { name: "Pet House", group: "ARMY", weight: 5 },
  { name: "Clan Castle", group: "ARMY", weight: 6 },

  // Defenses matter for trophy pushing / not getting 3-starred, but don't
  // compound the way resource/army buildings do.
  { name: "Cannon", group: "DEFENSE", weight: 4 },
  { name: "Archer Tower", group: "DEFENSE", weight: 4 },
  { name: "Mortar", group: "DEFENSE", weight: 4 },
  { name: "Air Defense", group: "DEFENSE", weight: 5 },
  { name: "Wizard Tower", group: "DEFENSE", weight: 5 },
  { name: "Air Sweeper", group: "DEFENSE", weight: 3 },
  { name: "Hidden Tesla", group: "DEFENSE", weight: 4 },
  { name: "Bomb Tower", group: "DEFENSE", weight: 4 },
  { name: "X-Bow", group: "DEFENSE", weight: 5 },
  { name: "Inferno Tower", group: "DEFENSE", weight: 6 },
  { name: "Eagle Artillery", group: "DEFENSE", weight: 5 },
  { name: "Scattershot", group: "DEFENSE", weight: 5 },
  { name: "Monolith", group: "DEFENSE", weight: 5 },
  { name: "Ricochet Cannon", group: "DEFENSE", weight: 5 },
  { name: "Multi-Archer Tower", group: "DEFENSE", weight: 5 },
  { name: "Spell Tower", group: "DEFENSE", weight: 5 },
  { name: "Giga Inferno", group: "DEFENSE", weight: 6 },
  { name: "Town Hall Weapon", group: "DEFENSE", weight: 6 },

  // Traps: cheap, situational.
  { name: "Bomb", group: "TRAP", weight: 2 },
  { name: "Spring Trap", group: "TRAP", weight: 2 },
  { name: "Giant Bomb", group: "TRAP", weight: 2 },
  { name: "Air Bomb", group: "TRAP", weight: 2 },
  { name: "Seeking Air Mine", group: "TRAP", weight: 2 },
  { name: "Skeleton Trap", group: "TRAP", weight: 2 },
  { name: "Tornado Trap", group: "TRAP", weight: 2 },
  { name: "Giant Cannon", group: "TRAP", weight: 2 },

  // Walls: cheap per-piece but there are dozens/hundreds of them - usually
  // last priority except as a gold/elixir sink when storages are capped and
  // nothing else is affordable.
  { name: "Wall", group: "WALL", weight: 1 },
];

export function buildingGroup(buildingType: string): BuildingGroup {
  return BUILDING_CATALOG.find((b) => b.name === buildingType)?.group ?? "OTHER";
}

export function buildingWeight(buildingType: string): number {
  return BUILDING_CATALOG.find((b) => b.name === buildingType)?.weight ?? 3;
}
