import { prisma } from "@/lib/db";
import { resolveUpgradeCost } from "./cost";

export interface NextTownHall {
  fromLevel: number;
  toLevel: number;
  currency: string;
  amount: number;
  minutes: number;
  costSource: "logged" | "gamedata" | "estimate";
}

// Informational only - deliberately not fed into the ranked upgrade plan.
// Rushing a Town Hall before maxing what you already have is a well-known
// bad trade in Clash of Clans (new TH unlocks higher caps you then can't
// use yet, while defenses lag behind attackers who see your new TH). This
// just answers "what would it cost right now", so you can weigh that
// against your own progress - it doesn't tell you to do it.
export async function getNextTownHall(): Promise<NextTownHall | null> {
  const latest = await prisma.playerSnapshot.findFirst({ orderBy: { fetchedAt: "desc" } });
  if (!latest) return null;

  const fromLevel = latest.townHallLevel;
  const toLevel = fromLevel + 1;
  const cost = await resolveUpgradeCost("BUILDING", "Town Hall", "GOLD", fromLevel, toLevel);

  return { fromLevel, toLevel, currency: cost.currency, amount: cost.amount, minutes: cost.minutes, costSource: cost.source };
}
