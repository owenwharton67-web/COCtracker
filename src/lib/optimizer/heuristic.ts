import { buildingWeight } from "@/data/building-catalog";

// Relative strategic weight by unit category. Heroes and equipment score
// highest because they're "always be upgrading" value with no defensive
// downside once queued (equipment is instant; heroes just need to not be
// mid-upgrade during an attack you care about). See README for the overall
// prioritization philosophy this encodes.
const UNIT_WEIGHT: Record<string, number> = {
  HERO: 10,
  HERO_EQUIPMENT: 9,
  TROOP: 6,
  SPELL: 6,
  SIEGE_MACHINE: 4,
  PET: 5,
};

export function weightFor(itemType: string, itemName: string): number {
  if (itemType === "BUILDING" || itemType === "WALL") {
    return buildingWeight(itemName);
  }
  return UNIT_WEIGHT[itemType] ?? 3;
}

// Higher score = do sooner. Rewards importance (weight) and punishes cost
// and time, but with diminishing sensitivity (sqrt) so one very expensive
// but important item doesn't get buried under a pile of trivial ones.
export function scoreCandidate(weight: number, amount: number, minutes: number): number {
  const costPenalty = Math.sqrt(amount + 1);
  const timePenalty = Math.sqrt(minutes / 60 + 1);
  return (weight * 1000) / (costPenalty * timePenalty);
}
