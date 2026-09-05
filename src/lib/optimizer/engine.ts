import { prisma } from "@/lib/db";
import { resolveUpgradeCost, type CostSource } from "./cost";
import { scoreCandidate, weightFor } from "./heuristic";
import {
  heroCurrency,
  equipmentCurrency,
  troopCurrency,
  spellCurrency,
  petCurrency,
  buildingCurrency,
  type Currency,
} from "@/data/currency";
import type { Queue, UpgradeCandidate, UpgradePlan } from "./types";

function currencyFor(itemType: string, itemName: string): Currency {
  switch (itemType) {
    case "HERO":
      return heroCurrency(itemName);
    case "HERO_EQUIPMENT":
      return equipmentCurrency();
    case "TROOP":
    case "SIEGE_MACHINE":
      return troopCurrency(itemName);
    case "SPELL":
      return spellCurrency(itemName);
    case "PET":
      return petCurrency();
    case "BUILDING":
    case "WALL":
      return buildingCurrency(itemName);
    default:
      return "GOLD";
  }
}

function queueFor(itemType: string): Queue {
  switch (itemType) {
    case "HERO":
      return "HERO_ALTAR";
    case "HERO_EQUIPMENT":
      return "INSTANT";
    case "TROOP":
    case "SIEGE_MACHINE":
    case "SPELL":
      return "LAB";
    case "PET":
      return "LAB"; // simplification: Pet House modeled as sharing the Lab queue - see README
    default:
      return "BUILDER";
  }
}

export async function buildUpgradePlan(): Promise<UpgradePlan> {
  const [units, buildings, resources] = await Promise.all([
    prisma.unitLevel.findMany({ where: { village: "home" } }),
    prisma.buildingInstance.findMany({ where: { village: "home" } }),
    prisma.resourceState.findUnique({ where: { id: 1 } }),
  ]);

  const balances = {
    GOLD: resources?.gold ?? 0,
    ELIXIR: resources?.elixir ?? 0,
    DARK_ELIXIR: resources?.darkElixir ?? 0,
    ORE: (resources?.shinyOre ?? 0) + (resources?.glowyOre ?? 0) + (resources?.starryOre ?? 0),
  } satisfies Record<Currency, number>;

  const buildersFree = resources?.buildersAvailable ?? 0;
  const labFree = !(resources?.labBusy ?? false);
  const petHouseFree = !(resources?.petHouseBusy ?? false);

  const pendingUnits = units.filter((u) => u.level < u.maxLevel);
  const buildingsWithCap = buildings.filter((b) => b.capLevel != null && b.level < b.capLevel);
  const buildingsMissingCap = buildings.filter((b) => b.capLevel == null);

  const candidates: UpgradeCandidate[] = [];

  for (const unit of pendingUnits) {
    const currency = currencyFor(unit.category, unit.name);
    const cost = await resolveUpgradeCost(unit.category, unit.name, currency, unit.level, unit.level + 1);
    const weight = weightFor(unit.category, unit.name);
    candidates.push({
      itemType: unit.category,
      itemName: unit.name,
      fromLevel: unit.level,
      toLevel: unit.level + 1,
      currency: cost.currency,
      amount: cost.amount,
      minutes: cost.minutes,
      costSource: cost.source,
      queue: queueFor(unit.category),
      score: scoreCandidate(weight, cost.amount, cost.minutes),
      reasons: buildReasons(unit.category, unit.level, unit.maxLevel, cost.source),
    });
  }

  for (const building of buildingsWithCap) {
    const currency = buildingCurrency(building.buildingType);
    const itemType = building.buildingType === "Wall" ? "WALL" : "BUILDING";
    const cost = await resolveUpgradeCost(
      itemType,
      building.buildingType,
      currency,
      building.level,
      building.level + 1,
    );
    const weight = weightFor(itemType, building.buildingType);
    candidates.push({
      itemType,
      itemName: `${building.buildingType} (x${building.count} at Lv${building.level})`,
      fromLevel: building.level,
      toLevel: building.level + 1,
      currency: cost.currency,
      amount: cost.amount,
      minutes: cost.minutes,
      costSource: cost.source,
      queue: queueFor(itemType),
      score: scoreCandidate(weight, cost.amount, cost.minutes),
      reasons: buildReasons(itemType, building.level, building.capLevel!, cost.source),
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  const slotsRemaining: Record<Queue, number> = {
    BUILDER: buildersFree,
    LAB: labFree || petHouseFree ? 1 : 0,
    HERO_ALTAR: Infinity,
    INSTANT: Infinity,
  };

  const affordableNow: UpgradeCandidate[] = [];
  const queuedNext: UpgradeCandidate[] = [];

  for (const candidate of candidates) {
    const canAfford = balances[candidate.currency] >= candidate.amount;
    const hasSlot = slotsRemaining[candidate.queue] > 0;

    if (canAfford && hasSlot) {
      affordableNow.push(candidate);
      slotsRemaining[candidate.queue] -= 1;
    } else {
      queuedNext.push(candidate);
    }
  }

  const blockedOnData: UpgradeCandidate[] = buildingsMissingCap.map((b) => ({
    itemType: b.buildingType === "Wall" ? "WALL" : "BUILDING",
    itemName: `${b.buildingType} (x${b.count} at Lv${b.level})`,
    fromLevel: b.level,
    toLevel: b.level + 1,
    currency: buildingCurrency(b.buildingType),
    amount: 0,
    minutes: 0,
    costSource: "estimate",
    queue: "BUILDER",
    score: 0,
    reasons: ["Set this building's cap level (shown in-game as \"Lvl X/Y\") to include it in the plan."],
  }));

  return {
    affordableNow: affordableNow.slice(0, 25),
    queuedNext: queuedNext.slice(0, 25),
    blockedOnData,
    summary: {
      totalPendingUnits: pendingUnits.length,
      totalPendingBuildings: buildingsWithCap.length,
      buildersFree,
      buildersTotal: resources?.builderTotalCount ?? 0,
      labFree,
    },
  };
}

function buildReasons(itemType: string, level: number, cap: number, source: CostSource): string[] {
  const reasons: string[] = [];
  const remaining = cap - level;
  reasons.push(`${remaining} level${remaining === 1 ? "" : "s"} below cap`);
  reasons.push(
    source === "logged"
      ? "cost from your logged upgrade history"
      : source === "gamedata"
        ? "cost from Clash of Clans' own game data"
        : "cost is an approximation - log the real value at /log",
  );
  if (itemType === "HERO_EQUIPMENT") reasons.push("instant - no builder or time needed");
  if (itemType === "HERO") reasons.push("upgrades independently, doesn't use a builder");
  return reasons;
}
