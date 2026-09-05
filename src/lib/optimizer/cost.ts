import { prisma } from "@/lib/db";
import { estimateUpgrade } from "@/data/cost-model";
import { lookupRealCost } from "@/data/real-costs";
import type { Currency } from "@/data/currency";

export type CostSource = "logged" | "gamedata" | "estimate";

export interface ResolvedCost {
  currency: Currency;
  amount: number;
  minutes: number;
  source: CostSource;
}

function logToCurrency(log: {
  goldCost: number | null;
  elixirCost: number | null;
  darkElixirCost: number | null;
  oreCost: number | null;
}): { currency: Currency; amount: number } | null {
  if (log.goldCost != null) return { currency: "GOLD", amount: log.goldCost };
  if (log.elixirCost != null) return { currency: "ELIXIR", amount: log.elixirCost };
  if (log.darkElixirCost != null) return { currency: "DARK_ELIXIR", amount: log.darkElixirCost };
  if (log.oreCost != null) return { currency: "ORE", amount: log.oreCost };
  return null;
}

// Three tiers, in order of trust:
// 1. "logged" - you told us the exact number the game showed you (/log).
// 2. "gamedata" - extracted from Clash of Clans' own game files (see
//    src/data/real-costs) - not your account-specific confirmation, but a
//    real, current-as-of-that-snapshot number, not a guess.
// 3. "estimate" - the smooth approximation curve (src/data/cost-model.ts),
//    used only when neither of the above has this item/level.
export async function resolveUpgradeCost(
  itemType: string,
  itemName: string,
  currency: Currency,
  fromLevel: number,
  toLevel: number,
): Promise<ResolvedCost> {
  const logged = await prisma.upgradeLog.findFirst({
    where: { itemType, itemName, fromLevel, toLevel },
    orderBy: { createdAt: "desc" },
  });

  if (logged) {
    const resolved = logToCurrency(logged);
    if (resolved) {
      return {
        currency: resolved.currency,
        amount: resolved.amount,
        minutes: logged.durationMinutes ?? 0,
        source: "logged",
      };
    }
  }

  const real = lookupRealCost(itemType, itemName, fromLevel, toLevel);
  if (real) {
    return { currency: real.currency, amount: real.amount, minutes: real.minutes, source: "gamedata" };
  }

  const estimate = estimateUpgrade(itemType, currency, fromLevel, toLevel);
  return { currency: estimate.currency, amount: estimate.amount, minutes: estimate.minutes, source: "estimate" };
}
