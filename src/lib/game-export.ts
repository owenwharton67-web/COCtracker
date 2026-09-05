import { prisma } from "./db";

// Parses Clash of Clans' own in-game village-export JSON (Settings -> ...
// -> Export, or wherever your game version puts it). This is a completely
// different format from this app's own /data/import schema (src/lib/
// data-transfer.ts) - detected automatically by the presence of
// "buildings2"/"traps2" arrays of {data, lvl, cnt} entries.
//
// Supercell's internal numeric "data" IDs have no verified public mapping
// to names, so this doesn't guess - unrecognized IDs are returned for the
// user to name once (see DataIdMapping in schema.prisma). A name learned
// once is remembered forever, since these IDs don't change for existing
// content.

interface RawExportEntry {
  data: number;
  lvl: number;
  cnt: number;
}

export interface UnresolvedEntry {
  dataId: number;
  category: "BUILDING" | "TRAP";
  level: number;
  count: number;
}

export interface GameExportResult {
  isGameExport: true;
  resolvedCount: number;
  unresolved: UnresolvedEntry[];
}

function isRawEntry(value: unknown): value is RawExportEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as RawExportEntry).data === "number" &&
    typeof (value as RawExportEntry).lvl === "number" &&
    typeof (value as RawExportEntry).cnt === "number"
  );
}

export function looksLikeGameExport(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.buildings2) || Array.isArray(obj.traps2);
}

export async function importGameExport(data: Record<string, unknown>): Promise<GameExportResult> {
  const sections: { key: string; category: "BUILDING" | "TRAP" }[] = [
    { key: "buildings2", category: "BUILDING" },
    { key: "traps2", category: "TRAP" },
  ];

  const mappings = await prisma.dataIdMapping.findMany();
  const mapById = new Map(mappings.map((m) => [m.dataId, m]));

  // Group by (dataId, level) so multiple identical buildings at the same
  // level collapse into one BuildingInstance row, matching how the rest of
  // the app already models buildings.
  const grouped = new Map<string, { dataId: number; category: "BUILDING" | "TRAP"; level: number; count: number }>();

  for (const { key, category } of sections) {
    const arr = data[key];
    if (!Array.isArray(arr)) continue;
    for (const entry of arr) {
      if (!isRawEntry(entry)) continue;
      const groupKey = `${entry.data}|${entry.lvl}`;
      const existing = grouped.get(groupKey);
      if (existing) {
        existing.count += entry.cnt;
      } else {
        grouped.set(groupKey, { dataId: entry.data, category, level: entry.lvl, count: entry.cnt });
      }
    }
  }

  let resolvedCount = 0;
  const unresolvedMap = new Map<number, UnresolvedEntry>();
  const writes: Promise<unknown>[] = [];

  for (const group of grouped.values()) {
    const mapping = mapById.get(group.dataId);
    if (mapping) {
      writes.push(
        prisma.buildingInstance.upsert({
          where: { buildingType_level_village: { buildingType: mapping.name, level: group.level, village: "home" } },
          create: { buildingType: mapping.name, level: group.level, count: group.count, village: "home" },
          update: { count: group.count },
        }),
      );
      resolvedCount += group.count;
    } else {
      // Surface one representative row per unknown ID (not per level) so
      // the naming form isn't cluttered with the same building at every
      // level it happens to appear at.
      const existing = unresolvedMap.get(group.dataId);
      if (!existing || group.count > existing.count) {
        unresolvedMap.set(group.dataId, {
          dataId: group.dataId,
          category: group.category,
          level: group.level,
          count: group.count,
        });
      }
    }
  }

  await Promise.all(writes);

  return {
    isGameExport: true,
    resolvedCount,
    unresolved: [...unresolvedMap.values()].sort((a, b) => a.dataId - b.dataId),
  };
}

// Called once the user names a batch of previously-unknown IDs. Persists
// the mapping (so every future export resolves it automatically) and
// applies it to the buildings/traps grouped in the same export.
export async function applyDataIdNames(
  named: { dataId: number; name: string; category: "BUILDING" | "TRAP"; level: number; count: number }[],
): Promise<void> {
  await prisma.$transaction([
    ...named.map((n) =>
      prisma.dataIdMapping.upsert({
        where: { dataId: n.dataId },
        create: { dataId: n.dataId, name: n.name, category: n.category },
        update: { name: n.name, category: n.category },
      }),
    ),
    ...named.map((n) =>
      prisma.buildingInstance.upsert({
        where: { buildingType_level_village: { buildingType: n.name, level: n.level, village: "home" } },
        create: { buildingType: n.name, level: n.level, count: n.count, village: "home" },
        update: { count: n.count },
      }),
    ),
  ]);
}
