import { prisma } from "./db";
import { MAGIC_ITEMS } from "@/data/magic-items";

// The JSON shape for /data/import - every section is optional, so a paste
// can update just one part (e.g. only "buildings") without touching the
// rest. See src/app/data/import/page.tsx for the human-facing explanation
// of where this data comes from (you, looking at your own village - see
// README for why nothing here can come from the CoC API).
export interface DataSnapshot {
  resources?: Partial<{
    gold: number;
    elixir: number;
    darkElixir: number;
    shinyOre: number;
    glowyOre: number;
    starryOre: number;
    gems: number;
    buildersAvailable: number;
    builderTotalCount: number;
    labBusy: boolean;
    petHouseBusy: boolean;
  }>;
  goldPass?: Partial<{
    active: boolean;
    purchased: boolean;
    seasonName: string | null;
    tier: number;
    seasonEndsAt: string | null;
  }>;
  magicItems?: Record<string, number>;
  buildings?: Array<{
    type: string;
    level: number;
    count: number;
    capLevel?: number | null;
    village?: string;
  }>;
}

export async function exportSnapshot(): Promise<DataSnapshot> {
  const [resources, goldPass, magicItems, buildings] = await Promise.all([
    prisma.resourceState.findUnique({ where: { id: 1 } }),
    prisma.goldPassState.findUnique({ where: { id: 1 } }),
    prisma.magicItem.findMany(),
    prisma.buildingInstance.findMany({ orderBy: [{ buildingType: "asc" }, { level: "asc" }] }),
  ]);

  return {
    resources: resources
      ? {
          gold: resources.gold,
          elixir: resources.elixir,
          darkElixir: resources.darkElixir,
          shinyOre: resources.shinyOre,
          glowyOre: resources.glowyOre,
          starryOre: resources.starryOre,
          gems: resources.gems,
          buildersAvailable: resources.buildersAvailable,
          builderTotalCount: resources.builderTotalCount,
          labBusy: resources.labBusy,
          petHouseBusy: resources.petHouseBusy,
        }
      : undefined,
    goldPass: goldPass
      ? {
          active: goldPass.active,
          purchased: goldPass.purchased,
          seasonName: goldPass.seasonName,
          tier: goldPass.tier,
          seasonEndsAt: goldPass.seasonEndsAt ? goldPass.seasonEndsAt.toISOString().slice(0, 10) : null,
        }
      : undefined,
    magicItems: Object.fromEntries(magicItems.map((m) => [m.itemKey, m.quantity])),
    buildings: buildings.map((b) => ({
      type: b.buildingType,
      level: b.level,
      count: b.count,
      capLevel: b.capLevel,
      village: b.village,
    })),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Applies whatever sections are present. Throws a human-readable error on
// the first structural problem it finds rather than silently skipping bad
// data - a partial, confusing import would be worse than a clear failure.
export async function importSnapshot(data: unknown): Promise<{ imported: string[] }> {
  if (!isPlainObject(data)) {
    throw new Error("Top-level JSON must be an object, e.g. { \"resources\": { ... } }");
  }

  const imported: string[] = [];

  if (data.resources !== undefined) {
    if (!isPlainObject(data.resources)) throw new Error('"resources" must be an object');
    const r = data.resources;
    await prisma.resourceState.upsert({
      where: { id: 1 },
      create: { id: 1, ...sanitizeResources(r) },
      update: sanitizeResources(r),
    });
    imported.push("resources");
  }

  if (data.goldPass !== undefined) {
    if (!isPlainObject(data.goldPass)) throw new Error('"goldPass" must be an object');
    const g = data.goldPass;
    const seasonEndsAt =
      typeof g.seasonEndsAt === "string" && g.seasonEndsAt.trim() ? new Date(g.seasonEndsAt) : null;
    const fields = {
      active: typeof g.active === "boolean" ? g.active : undefined,
      purchased: typeof g.purchased === "boolean" ? g.purchased : undefined,
      seasonName: typeof g.seasonName === "string" ? g.seasonName : undefined,
      tier: typeof g.tier === "number" ? g.tier : undefined,
      seasonEndsAt,
    };
    await prisma.goldPassState.upsert({
      where: { id: 1 },
      create: { id: 1, ...fields },
      update: fields,
    });
    imported.push("goldPass");
  }

  if (data.magicItems !== undefined) {
    if (!isPlainObject(data.magicItems)) throw new Error('"magicItems" must be an object of {itemKey: quantity}');
    const validKeys = new Set(MAGIC_ITEMS.map((m) => m.key));
    const entries = Object.entries(data.magicItems);
    for (const [key, qty] of entries) {
      if (typeof qty !== "number") throw new Error(`magicItems.${key} must be a number`);
      if (!validKeys.has(key)) continue; // ignore unknown keys rather than failing the whole import
    }
    await prisma.$transaction(
      entries
        .filter(([key]) => validKeys.has(key))
        .map(([key, qty]) =>
          prisma.magicItem.upsert({
            where: { itemKey: key },
            create: { itemKey: key, quantity: qty as number },
            update: { quantity: qty as number },
          }),
        ),
    );
    imported.push("magicItems");
  }

  if (data.buildings !== undefined) {
    if (!Array.isArray(data.buildings)) throw new Error('"buildings" must be an array');
    const rows = data.buildings.map((row, i) => {
      if (!isPlainObject(row)) throw new Error(`buildings[${i}] must be an object`);
      const type = row.type;
      const level = row.level;
      const count = row.count;
      if (typeof type !== "string" || !type.trim()) throw new Error(`buildings[${i}].type must be a non-empty string`);
      if (typeof level !== "number") throw new Error(`buildings[${i}].level must be a number`);
      if (typeof count !== "number") throw new Error(`buildings[${i}].count must be a number`);
      const capLevel = typeof row.capLevel === "number" ? row.capLevel : null;
      const village = typeof row.village === "string" ? row.village : "home";
      return { type, level, count, capLevel, village };
    });
    await prisma.$transaction(
      rows.map((row) =>
        prisma.buildingInstance.upsert({
          where: { buildingType_level_village: { buildingType: row.type, level: row.level, village: row.village } },
          create: { buildingType: row.type, level: row.level, count: row.count, capLevel: row.capLevel, village: row.village },
          update: { count: row.count, capLevel: row.capLevel },
        }),
      ),
    );
    imported.push("buildings");
  }

  if (imported.length === 0) {
    throw new Error('No recognized sections found. Expected one or more of: "resources", "goldPass", "magicItems", "buildings".');
  }

  return { imported };
}

function sanitizeResources(r: Record<string, unknown>) {
  const out: Record<string, number | boolean> = {};
  const numericKeys = [
    "gold",
    "elixir",
    "darkElixir",
    "shinyOre",
    "glowyOre",
    "starryOre",
    "gems",
    "buildersAvailable",
    "builderTotalCount",
  ];
  for (const key of numericKeys) {
    if (typeof r[key] === "number") out[key] = r[key] as number;
  }
  if (typeof r.labBusy === "boolean") out.labBusy = r.labBusy;
  if (typeof r.petHouseBusy === "boolean") out.petHouseBusy = r.petHouseBusy;
  return out;
}
