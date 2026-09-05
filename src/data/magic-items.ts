// Magic item catalog for the manual inventory UI and the optimizer's
// item-usage suggestions. Not exposed by the API - see README.

export type MagicItemEffect =
  | "FINISH_BUILDING" // Rune of Building: instantly finishes ALL active builder upgrades
  | "SKIP_BUILDING_TIME" // Book of Building: skips remaining time on one building upgrade
  | "SKIP_HERO_TIME" // Book of Heroes: skips remaining time on one hero upgrade
  | "SKIP_SPELL_TIME" // Book of Spells: skips remaining time on one troop/spell/pet lab upgrade
  | "SKIP_ANY_TIME" // Book of Everything: any of the above
  | "SET_BUILDING_LEVEL" // Hammer of Building: jumps one building to a specific level instantly
  | "SET_HERO_LEVEL" // Hammer of Heroes
  | "SET_SPELL_LEVEL" // Hammer of Spells / Fighting
  | "TEMP_RESOURCE_BOOST" // Resource potions: temporary production boost
  | "TEMP_BUILD_BOOST" // Power Potion / Builder Potion: temporary build-speed boost
  | "OTHER";

export interface MagicItemCatalogEntry {
  key: string;
  name: string;
  effect: MagicItemEffect;
  description: string;
}

export const MAGIC_ITEMS: MagicItemCatalogEntry[] = [
  {
    key: "rune_of_building",
    name: "Rune of Building",
    effect: "FINISH_BUILDING",
    description: "Instantly completes every currently in-progress builder (not lab/hero) upgrade.",
  },
  {
    key: "book_of_building",
    name: "Book of Building",
    effect: "SKIP_BUILDING_TIME",
    description: "Instantly finishes one in-progress building upgrade.",
  },
  {
    key: "book_of_heroes",
    name: "Book of Heroes",
    effect: "SKIP_HERO_TIME",
    description: "Instantly finishes one in-progress hero upgrade.",
  },
  {
    key: "book_of_spells",
    name: "Book of Spells",
    effect: "SKIP_SPELL_TIME",
    description: "Instantly finishes one in-progress troop/spell/pet lab upgrade.",
  },
  {
    key: "book_of_everything",
    name: "Book of Everything",
    effect: "SKIP_ANY_TIME",
    description: "Instantly finishes any one in-progress upgrade.",
  },
  {
    key: "hammer_of_building",
    name: "Hammer of Building",
    effect: "SET_BUILDING_LEVEL",
    description: "Jumps a building straight to a set level for free, no builder needed.",
  },
  {
    key: "hammer_of_heroes",
    name: "Hammer of Heroes",
    effect: "SET_HERO_LEVEL",
    description: "Jumps a hero straight to a set level for free.",
  },
  {
    key: "hammer_of_fighting",
    name: "Hammer of Fighting",
    effect: "SET_SPELL_LEVEL",
    description: "Jumps a troop/spell straight to a set level for free.",
  },
  {
    key: "gold_potion",
    name: "Gold Potion",
    effect: "TEMP_RESOURCE_BOOST",
    description: "Temporarily boosts Gold Mine/Storage-adjacent production.",
  },
  {
    key: "elixir_potion",
    name: "Elixir Potion",
    effect: "TEMP_RESOURCE_BOOST",
    description: "Temporarily boosts Elixir production.",
  },
  {
    key: "dark_elixir_potion",
    name: "Dark Elixir Potion",
    effect: "TEMP_RESOURCE_BOOST",
    description: "Temporarily boosts Dark Elixir production.",
  },
  {
    key: "builder_potion",
    name: "Builder Potion",
    effect: "TEMP_BUILD_BOOST",
    description: "Temporarily speeds up every active builder.",
  },
  {
    key: "power_potion",
    name: "Power Potion",
    effect: "TEMP_BUILD_BOOST",
    description: "Temporarily speeds up builders, lab, and troop training/spells at once.",
  },
  {
    key: "research_potion",
    name: "Research Potion",
    effect: "SKIP_SPELL_TIME",
    description: "Temporarily speeds up Laboratory research.",
  },
  {
    key: "shiny_ore",
    name: "Shiny Ore",
    effect: "OTHER",
    description: "Common-tier hero equipment upgrade currency.",
  },
  {
    key: "glowy_ore",
    name: "Glowy Ore",
    effect: "OTHER",
    description: "Mid-tier hero equipment upgrade currency.",
  },
  {
    key: "starry_ore",
    name: "Starry Ore",
    effect: "OTHER",
    description: "Top-tier hero equipment upgrade currency.",
  },
];

export function magicItemByKey(key: string): MagicItemCatalogEntry | undefined {
  return MAGIC_ITEMS.find((m) => m.key === key);
}
