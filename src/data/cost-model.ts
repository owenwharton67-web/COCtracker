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
  shape: "exp" | "linear";
  baseAmount: number;
  amountGrowth: number; // exp: multiplier per level. linear: flat increment per level.
  baseMinutes: number;
  minutesGrowth: number; // same distinction as amountGrowth.
}

// HERO and PET use "linear" rather than "exp": heroes run to ~90+ levels and
// pets to ~20, and real Dark Elixir hero/pet costs grow roughly linearly per
// level (steadily larger, not doubling-and-redoubling) - an exponential
// curve over that many levels would blow up to nonsense at the high end.
// Their constants below are calibrated from general knowledge of realistic
// magnitudes (low thousands of DE and minutes at level 1, low millions of DE
// and multi-day waits near current caps) rather than a verified per-level
// table - see the file header. Everything else keeps the exponential shape,
// which fits their much shorter level ranges (troops/spells top out around
// 10-12, most buildings well under 30).
const CURVES: Record<string, CurveParams> = {
  TROOP: { shape: "exp", baseAmount: 200, amountGrowth: 1.55, baseMinutes: 1, minutesGrowth: 1.5 },
  SIEGE_MACHINE: { shape: "exp", baseAmount: 20000, amountGrowth: 1.6, baseMinutes: 480, minutesGrowth: 1.4 },
  PET: { shape: "linear", baseAmount: 2000, amountGrowth: 47000, baseMinutes: 10, minutesGrowth: 150 },
  SPELL: { shape: "exp", baseAmount: 30000, amountGrowth: 1.5, baseMinutes: 30, minutesGrowth: 1.55 },
  HERO: { shape: "linear", baseAmount: 8000, amountGrowth: 28000, baseMinutes: 5, minutesGrowth: 48 },
  HERO_EQUIPMENT: { shape: "exp", baseAmount: 5000, amountGrowth: 1.35, baseMinutes: 0, minutesGrowth: 1 },
  BUILDING: { shape: "exp", baseAmount: 5000, amountGrowth: 1.5, baseMinutes: 20, minutesGrowth: 1.55 },
  WALL: { shape: "exp", baseAmount: 2000, amountGrowth: 1.75, baseMinutes: 0, minutesGrowth: 1 },
};

function curveFor(category: string): CurveParams {
  return CURVES[category] ?? CURVES.BUILDING;
}

function levelCost(category: string, level: number): { amount: number; minutes: number } {
  const c = curveFor(category);
  const n = Math.max(0, level - 1);
  if (c.shape === "linear") {
    return {
      amount: Math.round(c.baseAmount + c.amountGrowth * n),
      minutes: Math.round(c.baseMinutes + c.minutesGrowth * n),
    };
  }
  return {
    amount: Math.round(c.baseAmount * Math.pow(c.amountGrowth, n)),
    minutes: Math.round(c.baseMinutes * Math.pow(c.minutesGrowth, n)),
  };
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
