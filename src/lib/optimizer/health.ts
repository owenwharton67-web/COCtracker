import { prisma } from "@/lib/db";
import { buildingGroup, type BuildingGroup } from "@/data/building-catalog";

export interface CategoryHealth {
  key: string;
  label: string;
  percent: number;
  detail: string;
}

export interface WeakPoint {
  itemType: string;
  name: string;
  level: number;
  cap: number;
  gapPercent: number;
}

export interface BaseHealth {
  categories: CategoryHealth[];
  weakPoints: WeakPoint[];
}

const UNIT_LABELS: Record<string, string> = {
  HERO: "Heroes",
  HERO_EQUIPMENT: "Equipment",
  TROOP: "Troops",
  SIEGE_MACHINE: "Siege machines",
  SPELL: "Spells",
  PET: "Pets",
};

const BUILDING_GROUP_LABELS: Record<BuildingGroup, string> = {
  RESOURCE: "Resource buildings",
  ARMY: "Army buildings",
  DEFENSE: "Defenses",
  TRAP: "Traps",
  WALL: "Walls",
  OTHER: "Other buildings",
};

// Weighted by total levels (sum of current / sum of cap) rather than a
// simple count-of-maxed ratio, so "1 level behind" and "50 levels behind"
// don't look the same at a glance.
export async function computeBaseHealth(): Promise<BaseHealth | null> {
  const [units, buildings] = await Promise.all([
    prisma.unitLevel.findMany({ where: { village: "home" } }),
    prisma.buildingInstance.findMany({ where: { village: "home", capLevel: { not: null } } }),
  ]);

  if (units.length === 0 && buildings.length === 0) return null;

  const unitTotals = new Map<string, { level: number; cap: number }>();
  for (const u of units) {
    const t = unitTotals.get(u.category) ?? { level: 0, cap: 0 };
    t.level += u.level;
    t.cap += u.maxLevel;
    unitTotals.set(u.category, t);
  }

  const buildingTotals = new Map<BuildingGroup, { level: number; cap: number }>();
  for (const b of buildings) {
    if (b.capLevel == null) continue;
    const group = buildingGroup(b.buildingType);
    const t = buildingTotals.get(group) ?? { level: 0, cap: 0 };
    t.level += b.level * b.count;
    t.cap += b.capLevel * b.count;
    buildingTotals.set(group, t);
  }

  const categories: CategoryHealth[] = [];

  for (const [key, { level, cap }] of unitTotals) {
    if (cap === 0) continue;
    categories.push({
      key,
      label: UNIT_LABELS[key] ?? key,
      percent: (level / cap) * 100,
      detail: `${level.toLocaleString()}/${cap.toLocaleString()} total levels`,
    });
  }

  for (const [group, { level, cap }] of buildingTotals) {
    if (cap === 0) continue;
    categories.push({
      key: group,
      label: BUILDING_GROUP_LABELS[group],
      percent: (level / cap) * 100,
      detail: `${level.toLocaleString()}/${cap.toLocaleString()} total levels`,
    });
  }

  categories.sort((a, b) => a.percent - b.percent);

  const weakPoints: WeakPoint[] = [];

  for (const u of units) {
    if (u.level >= u.maxLevel || u.maxLevel === 0) continue;
    weakPoints.push({
      itemType: u.category,
      name: u.name,
      level: u.level,
      cap: u.maxLevel,
      gapPercent: (1 - u.level / u.maxLevel) * 100,
    });
  }

  for (const b of buildings) {
    if (b.capLevel == null || b.level >= b.capLevel) continue;
    weakPoints.push({
      itemType: b.buildingType === "Wall" ? "WALL" : "BUILDING",
      name: `${b.buildingType} (x${b.count})`,
      level: b.level,
      cap: b.capLevel,
      gapPercent: (1 - b.level / b.capLevel) * 100,
    });
  }

  weakPoints.sort((a, b) => b.gapPercent - a.gapPercent);

  return { categories, weakPoints: weakPoints.slice(0, 8) };
}
