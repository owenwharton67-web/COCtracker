import Link from "next/link";
import { prisma } from "@/lib/db";
import { relativeTime } from "@/lib/format-time";
import { ProgressRing } from "@/components/progress-ring";
import { Sparkline } from "@/components/sparkline";
import { TownHallBadge } from "@/components/town-hall-badge";
import { CategoryIcon } from "@/components/category-icon";
import { computeBaseHealth } from "@/lib/optimizer/health";
import {
  cardClasses,
  cardHeaderClasses,
  buttonClasses,
  badgeClasses,
  statTileClasses,
  statTileLabelClasses,
  statTileValueClasses,
  sectionLabelClasses,
  pageHeaderTitleClasses,
  focusRing,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [latest, lastSync, allUnits, buildings, resources, history] = await Promise.all([
    prisma.playerSnapshot.findFirst({ orderBy: { fetchedAt: "desc" } }),
    prisma.syncLog.findFirst({ orderBy: { ranAt: "desc" } }),
    prisma.unitLevel.findMany({ where: { village: "home" } }),
    prisma.buildingInstance.findMany({ where: { village: "home" } }),
    prisma.resourceState.findUnique({ where: { id: 1 } }),
    prisma.playerSnapshot.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 100,
      select: { trophies: true, warStars: true, clanCapitalContributions: true },
    }),
  ]);
  const chronological = [...history].reverse();
  const buildingCount = buildings.length;

  if (!latest) {
    return (
      <div className={cardClasses}>
        <h1 className={pageHeaderTitleClasses + " mb-2"}>Welcome</h1>
        <p className="text-sm text-muted mb-4 max-w-lg">
          No player data yet. Set <code className="text-accent">COC_PLAYER_TAG</code> and{" "}
          <code className="text-accent">COC_API_TOKEN</code> in your environment, then run a sync.
        </p>
        <Link href="/sync" className={buttonClasses}>
          Go to sync status
        </Link>
      </div>
    );
  }

  const pendingUnits = allUnits.filter((u) => u.level < u.maxLevel);
  const equipment = allUnits.filter((u) => u.category === "HERO_EQUIPMENT").sort((a, b) => a.name.localeCompare(b.name));
  const needsSetup = buildingCount === 0 || !resources;

  const unitsMaxed = allUnits.length - pendingUnits.length;
  const unitsPercent = allUnits.length > 0 ? (unitsMaxed / allUnits.length) * 100 : 0;

  const buildingsWithCap = buildings.filter((b) => b.capLevel != null);
  const buildingsMaxed = buildingsWithCap.filter((b) => b.level >= (b.capLevel as number));
  const buildingsPercent = buildingsWithCap.length > 0 ? (buildingsMaxed.length / buildingsWithCap.length) * 100 : null;

  const overallPercent =
    buildingsPercent != null ? (unitsPercent + buildingsPercent) / 2 : unitsPercent;

  const health = await computeBaseHealth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <TownHallBadge level={latest.townHallLevel} weaponLevel={latest.townHallWeaponLevel} />
          <h1 className={pageHeaderTitleClasses}>
            {latest.name} <span className="text-faint font-normal">{latest.tag}</span>
          </h1>
        </div>
        <SyncBadge ok={lastSync?.success ?? false} at={latest.fetchedAt} />
      </div>

      <div className={cardClasses}>
        <div className={sectionLabelClasses + " mb-4"}>Progress toward maxed TH{latest.townHallLevel}</div>
        <div className="flex flex-wrap justify-around gap-6">
          <ProgressRing percent={overallPercent} label="Overall" sublabel="units + buildings" />
          <ProgressRing percent={unitsPercent} label="Army" sublabel={`${unitsMaxed}/${allUnits.length} maxed`} />
          {buildingsPercent != null ? (
            <ProgressRing percent={buildingsPercent} label="Buildings" sublabel={`${buildingsMaxed.length}/${buildingsWithCap.length} maxed`} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center max-w-[140px]">
              <span className="text-faint text-xs">
                Add cap levels on the{" "}
                <Link href="/data/buildings" className="text-accent hover:underline">
                  Buildings
                </Link>{" "}
                page to track building progress
              </span>
            </div>
          )}
        </div>
      </div>

      {chronological.length >= 2 && (
        <div className="grid sm:grid-cols-3 gap-3">
          <Sparkline
            label="Trophies"
            currentLabel={String(latest.trophies)}
            values={chronological.map((h) => h.trophies)}
          />
          <Sparkline
            label="War stars"
            currentLabel={String(latest.warStars)}
            values={chronological.map((h) => h.warStars)}
          />
          <Sparkline
            label="Capital contributions"
            currentLabel={latest.clanCapitalContributions.toLocaleString()}
            values={chronological.map((h) => h.clanCapitalContributions)}
          />
        </div>
      )}

      {health && <BaseHealthCard health={health} />}

      {lastSync && !lastSync.success && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger flex items-center justify-between gap-4">
          <span>Last sync attempt failed: {lastSync.message}</span>
          <Link href="/sync" className="underline shrink-0">
            Details
          </Link>
        </div>
      )}

      {needsSetup && (
        <div className={cardClasses + " border-accent/30"}>
          <h2 className={cardHeaderClasses}>Get the full picture</h2>
          <p className="text-sm text-muted mb-3">
            The account side (heroes, troops, spells, stats) is already syncing itself. Add what the API can&apos;t
            see - buildings, resources on hand, magic items - to unlock the full upgrade plan.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/data/import" className={buttonClasses}>
              Bulk import (fastest)
            </Link>
            <Link href="/data/buildings" className={badgeClasses("neutral") + " no-underline hover:bg-surface-hover"}>
              Add buildings manually
            </Link>
          </div>
        </div>
      )}

      <div>
        <div className={sectionLabelClasses + " mb-2"}>Account</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile
            label="Town Hall"
            value={`TH${latest.townHallLevel}`}
            sub={latest.townHallWeaponLevel ? `Weapon Lv${latest.townHallWeaponLevel}` : undefined}
          />
          <StatTile label="Builder Hall" value={latest.builderHallLevel ? `BH${latest.builderHallLevel}` : "-"} />
          <StatTile label="Experience" value={`Lv ${latest.expLevel}`} />
          <StatTile label="Trophies" value={String(latest.trophies)} sub={`best ${latest.bestTrophies}`} />
          <StatTile label="League" value={latest.leagueName ?? "Unranked"} />
          <StatTile label="War stars" value={String(latest.warStars)} />
          <StatTile label="Attack / Defense" value={`${latest.attackWins} / ${latest.defenseWins}`} />
          <StatTile
            label="Clan"
            value={latest.clanName ?? "None"}
            sub={latest.clanName ? (latest.clanRole ?? "member") : undefined}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Upgrade plan"
          value={`${pendingUnits.length} of ${allUnits.length} units below cap`}
          href="/plan"
          cta="View recommendations"
        />
        <SummaryCard
          title="Buildings tracked"
          value={buildingCount > 0 ? `${buildingCount} building groups` : "Not set up yet"}
          href="/data/buildings"
          cta="Manage buildings"
        />
        <SummaryCard
          title="Resources & items"
          value={resources ? "Up to date" : "Not set up yet"}
          href="/data/resources"
          cta="Update now"
        />
      </div>

      {equipment.length > 0 && (
        <div className={cardClasses}>
          <h2 className={cardHeaderClasses}>Hero equipment (Blacksmith)</h2>
          <p className="text-sm text-muted mb-3">
            Everything you own, synced automatically - equipped or not, maxed or not.
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
            {equipment.map((eq) => (
              <div key={eq.name} className="flex items-center gap-2 justify-between py-1.5 border-b border-border last:border-0 text-sm">
                <span className="flex items-center gap-2 text-text">
                  <CategoryIcon kind="HERO_EQUIPMENT" className="h-3.5 w-3.5 text-faint shrink-0" />
                  {eq.name}
                </span>
                <span className={eq.level >= eq.maxLevel ? badgeClasses("success") : badgeClasses("neutral")}>
                  Lv{eq.level}/{eq.maxLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BaseHealthCard({ health }: { health: Awaited<ReturnType<typeof computeBaseHealth>> }) {
  if (!health) return null;
  return (
    <div className={cardClasses}>
      <h2 className={cardHeaderClasses}>Base health</h2>
      <p className="text-sm text-muted mb-4">
        How far each part of your base lags behind what&apos;s currently possible, weighted by total levels (not
        just item count) so a big gap stands out more than a small one.
      </p>

      <div className="space-y-2.5 mb-5">
        {health.categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted">
              <CategoryIcon kind={cat.key} className="h-3.5 w-3.5" />
            </span>
            <span className="w-36 shrink-0 text-xs text-muted truncate">{cat.label}</span>
            <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
              <div
                className={"h-full rounded-full " + (cat.percent < 60 ? "bg-danger" : cat.percent < 85 ? "bg-accent" : "bg-success")}
                style={{ width: `${Math.max(2, Math.min(100, cat.percent))}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs font-medium text-text">{Math.round(cat.percent)}%</span>
          </div>
        ))}
      </div>

      {health.weakPoints.length > 0 && (
        <>
          <div className={sectionLabelClasses + " mb-2"}>Most underleveled right now</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {health.weakPoints.map((w, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
                <CategoryIcon kind={w.itemType} className="h-4 w-4 text-faint shrink-0" />
                <span className="text-text truncate flex-1">{w.name}</span>
                <span className="text-xs text-faint shrink-0">
                  Lv{w.level}/{w.cap}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SyncBadge({ ok, at }: { ok: boolean; at: Date }) {
  return (
    <span className={badgeClasses(ok ? "success" : "danger")} title={new Date(at).toLocaleString()}>
      <span className={"h-1.5 w-1.5 rounded-full " + (ok ? "bg-success" : "bg-danger")} />
      Synced {relativeTime(at)}
    </span>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={statTileClasses}>
      <div className={statTileLabelClasses}>{label}</div>
      <div className={statTileValueClasses}>{value}</div>
      {sub && <div className="text-xs text-faint mt-0.5">{sub}</div>}
    </div>
  );
}

function SummaryCard({ title, value, href, cta }: { title: string; value: string; href: string; cta: string }) {
  return (
    <Link href={href} className={cardClasses + ` block hover:border-border-strong transition-colors ${focusRing}`}>
      <h2 className="text-sm font-medium text-muted">{title}</h2>
      <p className="mt-1 mb-3 text-text font-medium">{value}</p>
      <span className="text-sm text-accent">{cta} &rarr;</span>
    </Link>
  );
}
