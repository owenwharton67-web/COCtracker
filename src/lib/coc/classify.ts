// The API returns "troops" as one flat list that actually mixes three very
// different things: real troops, siege machines, and pets. There's no field
// distinguishing them, so we classify by name.

const SIEGE_MACHINES = new Set([
  "Wall Wrecker",
  "Battle Blimp",
  "Stone Slammer",
  "Siege Barracks",
  "Log Launcher",
  "Flame Flinger",
  "Battle Drill",
  "Troop Launcher",
]);

const PETS = new Set([
  "L.A.S.S.I",
  "Electro Owl",
  "Mighty Yak",
  "Unicorn",
  "Frosty",
  "Diggy",
  "Poison Lizard",
  "Phoenix",
  "Spirit Fox",
  "Angry Jelly",
  "Sneezy",
]);

export type UnitCategory = "HERO" | "HERO_EQUIPMENT" | "TROOP" | "SIEGE_MACHINE" | "SPELL" | "PET";

export function classifyTroop(name: string): "TROOP" | "SIEGE_MACHINE" | "PET" {
  if (SIEGE_MACHINES.has(name)) return "SIEGE_MACHINE";
  if (PETS.has(name)) return "PET";
  return "TROOP";
}
