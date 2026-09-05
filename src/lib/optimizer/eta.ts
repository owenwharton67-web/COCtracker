import { prisma } from "@/lib/db";
import { estimateUpgrade } from "@/data/cost-model";
import { lookupRealCost } from "@/data/real-costs";

export interface TimeToMaxEstimate {
  builderDays: number;
  labDays: number;
  heroDays: number;
  overallDays: number;
  bottleneck: "BUILDER" | "LAB" | "HERO" | "NONE";
  slowestHero: string | null;
}

// Full remaining-time estimate, unlike the upgrade plan (which only shows
// the next single level per item). Answers "how long would every remaining
// upgrade take, back to back, on each independent track" - builders share
// one pool, the Lab/Pet House share one queue, and each hero upgrades on
// its own independent timer.
//
// This deliberately ignores resource income (we don't track it - see
// README) - it's a lower bound assuming resources are never the
// bottleneck, not a promise of a real finish date. Still a useful signal:
// if this number is huge, the real bottleneck is builder/lab time, not
// grinding; if it's small, resources are what's actually slowing you down.
export async function estimateTimeToMax(): Promise<TimeToMaxEstimate | null> {
  const [units, buildings, logs] = await Promise.all([
    prisma.unitLevel.findMany({ where: { village: "home" } }),
    prisma.buildingInstance.findMany({ where: { village: "home", capLevel: { not: null } } }),
    prisma.upgradeLog.findMany(),
  ]);

  if (units.length === 0 && buildings.length === 0) return null;

  const logged = new Map<string, number>();
  for (const log of logs) {
    if (log.durationMinutes == null) continue;
    logged.set(`${log.itemType}|${log.itemName}|${log.fromLevel}|${log.toLevel}`, log.durationMinutes);
  }

  function minutesFor(itemType: string, itemName: string, fromLevel: number, toLevel: number): number {
    const key = `${itemType}|${itemName}|${fromLevel}|${toLevel}`;
    const loggedMinutes = logged.get(key);
    if (loggedMinutes != null) return loggedMinutes;
    const real = lookupRealCost(itemType, itemName, fromLevel, toLevel);
    if (real) return real.minutes;
    // estimateUpgrade only needs currency for its return shape, not the
    // minutes math, so any placeholder currency is fine here.
    return estimateUpgrade(itemType, "GOLD", fromLevel, toLevel).minutes;
  }

  let builderMinutes = 0;
  let labMinutes = 0;
  const heroMinutes = new Map<string, number>();

  for (const unit of units) {
    if (unit.level >= unit.maxLevel) continue;
    let total = 0;
    for (let lvl = unit.level; lvl < unit.maxLevel; lvl++) {
      total += minutesFor(unit.category, unit.name, lvl, lvl + 1);
    }
    if (unit.category === "HERO") {
      heroMinutes.set(unit.name, (heroMinutes.get(unit.name) ?? 0) + total);
    } else if (unit.category === "HERO_EQUIPMENT") {
      // instant, no time cost
    } else {
      labMinutes += total; // TROOP, SIEGE_MACHINE, SPELL, PET share the Lab/Pet House queue
    }
  }

  for (const building of buildings) {
    if (building.capLevel == null || building.level >= building.capLevel) continue;
    let total = 0;
    const itemType = building.buildingType === "Wall" ? "WALL" : "BUILDING";
    for (let lvl = building.level; lvl < building.capLevel; lvl++) {
      total += minutesFor(itemType, building.buildingType, lvl, lvl + 1);
    }
    // `count` identical buildings each need their own builder-minutes.
    builderMinutes += total * building.count;
  }

  const resources = await prisma.resourceState.findUnique({ where: { id: 1 } });
  const builders = Math.max(1, resources?.builderTotalCount ?? 5);

  const builderDays = builderMinutes / builders / 60 / 24;
  const labDays = labMinutes / 60 / 24;

  let slowestHero: string | null = null;
  let heroDays = 0;
  for (const [name, minutes] of heroMinutes) {
    const days = minutes / 60 / 24;
    if (days > heroDays) {
      heroDays = days;
      slowestHero = name;
    }
  }

  const overallDays = Math.max(builderDays, labDays, heroDays);
  const bottleneck =
    overallDays === 0
      ? "NONE"
      : overallDays === builderDays
        ? "BUILDER"
        : overallDays === labDays
          ? "LAB"
          : "HERO";

  return { builderDays, labDays, heroDays, overallDays, bottleneck, slowestHero };
}
