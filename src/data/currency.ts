// What currency each unit/building spends to upgrade. This is stable game
// knowledge (it doesn't change between balance patches the way exact costs
// do), so it's tracked with much higher confidence than src/data/cost-model.ts.

export type Currency = "GOLD" | "ELIXIR" | "DARK_ELIXIR" | "ORE";

const DARK_ELIXIR_TROOPS = new Set([
  "Minion",
  "Hog Rider",
  "Valkyrie",
  "Golem",
  "Witch",
  "Lava Hound",
  "Bowler",
  "Ice Golem",
  "Headhunter",
  "Apprentice Warden",
  "Druid",
  "Furnace",
]);

const DARK_SPELLS = new Set([
  "Poison Spell",
  "Earthquake Spell",
  "Haste Spell",
  "Skeleton Spell",
  "Bat Spell",
  "Overgrowth Spell",
]);

const ELIXIR_HEROES = new Set(["Grand Warden"]);
// Everything else in HERO (Barbarian King, Archer Queen, Royal Champion,
// Minion Prince, ...) upgrades with Dark Elixir.

export function troopCurrency(name: string): Currency {
  return DARK_ELIXIR_TROOPS.has(name) ? "DARK_ELIXIR" : "ELIXIR";
}

export function spellCurrency(name: string): Currency {
  return DARK_SPELLS.has(name) ? "DARK_ELIXIR" : "ELIXIR";
}

export function heroCurrency(name: string): Currency {
  return ELIXIR_HEROES.has(name) ? "ELIXIR" : "DARK_ELIXIR";
}

// Pets upgrade with Dark Elixir at the Pet House.
export function petCurrency(): Currency {
  return "DARK_ELIXIR";
}

// Hero equipment always upgrades with Ore (Shiny -> Glowy -> Starry as
// rarity/tier increases), never gold/elixir/dark elixir.
export function equipmentCurrency(): Currency {
  return "ORE";
}

// Buildings: CoC deliberately cross-wires resource buildings so hoarding one
// resource doesn't stall progress - Gold Mine/Storage upgrade with Elixir,
// Elixir Collector/Storage upgrade with Gold. Dark Elixir Drill/Storage use
// a Gold+Elixir mix at low levels; modeled here as GOLD for simplicity - see
// the cost-model disclaimer.
const BUILDING_CURRENCY: Record<string, Currency> = {
  "Gold Mine": "ELIXIR",
  "Gold Storage": "ELIXIR",
  "Elixir Collector": "GOLD",
  "Elixir Storage": "GOLD",
  "Dark Elixir Drill": "GOLD",
  "Dark Elixir Storage": "GOLD",
  "Inferno Tower": "DARK_ELIXIR",
  "Eagle Artillery": "DARK_ELIXIR",
  "Scattershot": "DARK_ELIXIR",
  "Giga Inferno": "DARK_ELIXIR",
  "Ricochet Cannon": "DARK_ELIXIR",
  "Multi-Archer Tower": "DARK_ELIXIR",
  "Air Defense": "ELIXIR",
  "Hidden Tesla": "ELIXIR",
  "X-Bow": "GOLD",
  "Monolith": "DARK_ELIXIR",
  "Spell Tower": "DARK_ELIXIR",
  "Wall": "GOLD",
};

export function buildingCurrency(buildingType: string): Currency {
  return BUILDING_CURRENCY[buildingType] ?? "GOLD";
}
