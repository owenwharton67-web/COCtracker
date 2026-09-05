import { prisma } from "./db";
import { getPlayer, CocApiError, type CocPlayer } from "./coc/client";
import { classifyTroop } from "./coc/classify";

export interface SyncResult {
  success: boolean;
  message: string;
  statusCode?: number;
  player?: CocPlayer;
}

// Pulls the current state of the account from the CoC API, records a
// PlayerSnapshot (full history) and upserts UnitLevel (latest-known level of
// every hero/troop/spell/equipment/pet, for the optimizer to read cheaply).
// Meant to be called on a ~3 minute cadence - see the cron route and
// scripts/poll.ts, both of which call this same function.
export async function runSync(): Promise<SyncResult> {
  const tag = process.env.COC_PLAYER_TAG?.trim();
  if (!tag) {
    const message = "COC_PLAYER_TAG is not set in .env - nothing to sync.";
    await logResult(false, message);
    return { success: false, message };
  }

  try {
    const player = await getPlayer(tag);
    await persistPlayer(player);
    const message = `Synced ${player.name} (${player.tag}) - TH${player.townHallLevel}`;
    await logResult(true, message);
    return { success: true, message, player };
  } catch (err) {
    const status = err instanceof CocApiError ? err.status : undefined;
    const message = err instanceof Error ? err.message : String(err);
    await logResult(false, message, status);
    return { success: false, message, statusCode: status };
  }
}

async function logResult(success: boolean, message: string, statusCode?: number) {
  await prisma.syncLog.create({
    data: { success, message, statusCode },
  });
}

async function persistPlayer(player: CocPlayer) {
  await prisma.playerSnapshot.create({
    data: {
      tag: player.tag,
      name: player.name,
      townHallLevel: player.townHallLevel,
      townHallWeaponLevel: player.townHallWeaponLevel ?? null,
      expLevel: player.expLevel,
      trophies: player.trophies,
      bestTrophies: player.bestTrophies,
      warStars: player.warStars,
      attackWins: player.attackWins,
      defenseWins: player.defenseWins,
      builderHallLevel: player.builderHallLevel ?? null,
      builderBaseTrophies: player.builderBaseTrophies ?? null,
      bestBuilderBaseTrophies: player.bestBuilderBaseTrophies ?? null,
      donations: player.donations,
      donationsReceived: player.donationsReceived,
      clanCapitalContributions: player.clanCapitalContributions,
      leagueName: player.league?.name ?? null,
      builderBaseLeagueName: player.builderBaseLeague?.name ?? null,
      clanTag: player.clan?.tag ?? null,
      clanName: player.clan?.name ?? null,
      clanRole: player.role ?? null,
      warPreference: player.warPreference ?? null,
      legendLeagueRank: player.legendStatistics?.currentSeason?.rank ?? null,
      raw: JSON.stringify(player),
    },
  });

  const upserts: Promise<unknown>[] = [];

  for (const hero of player.heroes ?? []) {
    upserts.push(upsertUnit(hero.name, "HERO", hero.village, hero.level, hero.maxLevel));
    for (const eq of hero.equipment ?? []) {
      upserts.push(upsertUnit(eq.name, "HERO_EQUIPMENT", hero.village, eq.level, eq.maxLevel));
    }
  }

  for (const eq of player.heroEquipment ?? []) {
    upserts.push(upsertUnit(eq.name, "HERO_EQUIPMENT", eq.village, eq.level, eq.maxLevel));
  }

  for (const troop of player.troops ?? []) {
    upserts.push(
      upsertUnit(troop.name, classifyTroop(troop.name), troop.village, troop.level, troop.maxLevel),
    );
  }

  for (const spell of player.spells ?? []) {
    upserts.push(upsertUnit(spell.name, "SPELL", spell.village, spell.level, spell.maxLevel));
  }

  await Promise.all(upserts);
}

function upsertUnit(
  name: string,
  category: string,
  village: string,
  level: number,
  maxLevel: number,
) {
  return prisma.unitLevel.upsert({
    where: { name_village: { name, village } },
    create: { name, category, village, level, maxLevel },
    update: { category, level, maxLevel },
  });
}
