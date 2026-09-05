// Real per-level upgrade costs/times, extracted from Clash of Clans' own
// game-data files (the CSVs Supercell ships inside the game client) rather
// than approximated - see src/data/cost-model.ts for why an approximation
// exists at all, and why this is a meaningfully more trustworthy source
// than that fallback.
//
// Known limitation: this is a snapshot of the game files at some point in
// time, not a live feed - it's missing at least Minion Prince (heroes) and
// several newer pets (Frosty onward), which didn't exist yet in this
// snapshot. Anything covered here should be accurate for what it covers;
// anything NOT found here falls back to the cost-model.ts estimate.
import type { Currency } from "@/data/currency";
import heroes from "./heroes.json";
import pets from "./pets.json";
import troops from "./troops.json";
import spells from "./spells.json";
import buildings from "./buildings.json";
import traps from "./traps.json";

interface RealLevelCost {
  amount: number;
  currency: Currency;
  minutes: number;
}

type RealCostTable = Record<string, Record<string, RealLevelCost>>;

const TABLES: Record<string, RealCostTable> = {
  HERO: heroes as RealCostTable,
  PET: pets as RealCostTable,
  TROOP: troops as RealCostTable,
  SIEGE_MACHINE: troops as RealCostTable,
  SPELL: spells as RealCostTable,
  BUILDING: buildings as RealCostTable,
  WALL: buildings as RealCostTable,
};

const BUILDING_TABLES = [buildings as RealCostTable, traps as RealCostTable];

// Sums every level from fromLevel+1 to toLevel (usually just one level, but
// supports multi-level jumps too). Returns null if ANY level in the range
// is missing from the table, rather than a partial/misleading sum.
export function lookupRealCost(
  itemType: string,
  itemName: string,
  fromLevel: number,
  toLevel: number,
): RealLevelCost | null {
  const tables = itemType === "BUILDING" || itemType === "WALL" ? BUILDING_TABLES : [TABLES[itemType]];

  for (const table of tables) {
    if (!table) continue;
    const entity = table[itemName];
    if (!entity) continue;

    let amount = 0;
    let minutes = 0;
    let currency: Currency | null = null;
    let complete = true;

    for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
      const step = entity[String(lvl)];
      if (!step) {
        complete = false;
        break;
      }
      amount += step.amount;
      minutes += step.minutes;
      currency = step.currency;
    }

    if (complete && currency) {
      return { amount, currency, minutes };
    }
  }

  return null;
}
