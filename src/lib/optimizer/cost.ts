import { prisma } from "@/lib/db";
import { estimateUpgrade } from "@/data/cost-model";
import type { Currency } from "@/data/currency";

export interface ResolvedCost {
  currency: Currency;
  amount: number;
  minutes: number;
  exact: boolean;
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

// Prefers a real, user-logged cost (see UpgradeLog / the /log page) for the
// exact fromLevel -> fromLevel+1 jump; falls back to the approximate curve
// in src/data/cost-model.ts otherwise. See that file for why the fallback
// exists and what it is and isn't good for.
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
        exact: true,
      };
    }
  }

  const estimate = estimateUpgrade(itemType, currency, fromLevel, toLevel);
  return { currency: estimate.currency, amount: estimate.amount, minutes: estimate.minutes, exact: false };
}
