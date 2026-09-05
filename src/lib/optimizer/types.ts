import type { Currency } from "@/data/currency";
import type { CostSource } from "./cost";

export type Queue = "BUILDER" | "LAB" | "HERO_ALTAR" | "INSTANT";

export interface UpgradeCandidate {
  itemType: string; // HERO | HERO_EQUIPMENT | TROOP | SIEGE_MACHINE | SPELL | PET | BUILDING | WALL
  itemName: string;
  fromLevel: number;
  toLevel: number;
  currency: Currency;
  amount: number;
  minutes: number;
  costSource: CostSource; // logged (your account) > gamedata (extracted, verified) > estimate (approximation)
  queue: Queue;
  score: number;
  reasons: string[];
}

export interface UpgradePlan {
  affordableNow: UpgradeCandidate[]; // top-ranked, currently affordable, a free slot exists
  queuedNext: UpgradeCandidate[]; // ranked but blocked on resources, a busy slot, or missing capLevel
  blockedOnData: UpgradeCandidate[]; // buildings with no capLevel set, so we can't tell if they're maxed
  summary: {
    totalPendingUnits: number;
    totalPendingBuildings: number;
    buildersFree: number;
    buildersTotal: number;
    labFree: boolean;
  };
}
