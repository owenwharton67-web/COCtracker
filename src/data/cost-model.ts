// ---------------------------------------------------------------------------
// IMPORTANT: this is a smooth APPROXIMATION, not a copy of Supercell's real
// per-level cost table.
//
// Exact upgrade costs/times for every level of every troop, spell, hero,
// piece of equipment, and building (per Town Hall) would be many thousands
// of individual numbers, they drift with balance-patch history, and I don't
// have a verified, current, exhaustive source for all of them baked into
// this app. Publishing fabricated numbers as if they were exact would make
// this tool actively misleading for real resource planning.
//
// Instead, this model produces a believable cost/time CURVE (cheap and fast
// at low levels, exponentially more expensive near an item's cap) that's
// good enough for *relative* prioritization - "is this upgrade currently
// cheap and fast relative to my other options" - which is what the
// optimizer actually needs to rank upgrades.
//
// For real amounts, log what the game shows you in the upgrade
// confirmation screen via the Upgrade Log (see /log in the app). Any item
// with a matching UpgradeLog entry uses that real, exact number instead of
// this estimate - see src/lib/optimizer/cost.ts.
// ---------------------------------------------------------------------------

import type { Currency } from "./currency";

export interface CostEstimate {
  currency: Currency;
  amount: number;
  minutes: number;
  approximate: true;
}

interface CurveParams {
  baseAmount: number;
  amountGrowth: number;
  baseMinutes: number;
  minutesGrowth: number;
}

const CURVES: Record<string, CurveParams> = {
  TROOP: { baseAmount: 200, amountGrowth: 1.55, baseMinutes: 1, minutesGrowth: 1.5 },
  SIEGE_MACHINE: { baseAmount: 20000, amountGrowth: 1.6, baseMinutes: 480, minutesGrowth: 1.4 },
  PET: { baseAmount: 15000, amountGrowth: 1.5, baseMinutes: 240, minutesGrowth: 1.35 },
  SPELL: { baseAmount: 30000, amountGrowth: 1.5, baseMinutes: 30, minutesGrowth: 1.55 },
  HERO: { baseAmount: 10000, amountGrowth: 1.42, baseMinutes: 60, minutesGrowth: 1.35 },
  HERO_EQUIPMENT: { baseAmount: 5000, amountGrowth: 1.35, baseMinutes: 0, minutesGrowth: 1 },
  BUILDING: { baseAmount: 5000, amountGrowth: 1.5, baseMinutes: 20, minutesGrowth: 1.55 },
  WALL: { baseAmount: 2000, amountGrowth: 1.75, baseMinutes: 0, minutesGrowth: 1 },
};

function curveFor(category: string): CurveParams {
  return CURVES[category] ?? CURVES.BUILDING;
}

function levelCost(category: string, level: number): { amount: number; minutes: number } {
  const c = curveFor(category);
  const amount = Math.round(c.baseAmount * Math.pow(c.amountGrowth, Math.max(0, level - 1)));
  const minutes = Math.round(c.baseMinutes * Math.pow(c.minutesGrowth, Math.max(0, level - 1)));
  return { amount, minutes };
}

// Sums the estimated cost of going from `fromLevel` to `toLevel` (each
// intervening level upgrade has its own, increasing, cost).
export function estimateUpgrade(
  category: string,
  currency: Currency,
  fromLevel: number,
  toLevel: number,
): CostEstimate {
  let amount = 0;
  let minutes = 0;
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    const step = levelCost(category, lvl);
    amount += step.amount;
    minutes += step.minutes;
  }
  return { currency, amount, minutes, approximate: true };
}
