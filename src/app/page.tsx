import Link from "next/link";
import { prisma } from "@/lib/db";
import { cardClasses, buttonClasses } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [latest, lastSync, allUnits, buildingCount] = await Promise.all([
    prisma.playerSnapshot.findFirst({ orderBy: { fetchedAt: "desc" } }),
    prisma.syncLog.findFirst({ orderBy: { ranAt: "desc" } }),
    prisma.unitLevel.findMany({ select: { level: true, maxLevel: true } }),
    prisma.buildingInstance.count(),
  ]);

  const pendingUnitCount = allUnits.filter((u) => u.level < u.maxLevel).length;

  if (!latest) {
    return (
      <div className={cardClasses}>
        <h1 className="text-lg font-semibold mb-2">No data yet</h1>
        <p className="text-sm text-black/70 dark:text-white/70 mb-4">
          Set <code>COC_PLAYER_TAG</code> and <code>COC_API_TOKEN</code> in <code>.env</code>, then trigger a
          sync from the Sync status page (or wait for the scheduled job).
        </p>
        <Link href="/sync" className={buttonClasses}>
          Go to Sync status
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cardClasses}>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-xl font-semibold">
            {latest.name} <span className="text-black/50 dark:text-white/50">({latest.tag})</span>
          </h1>
          <span className="text-xs text-black/50 dark:text-white/50">
            Last synced {new Date(latest.fetchedAt).toLocaleString()}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <Stat
            label="Town Hall"
            value={`TH${latest.townHallLevel}${latest.townHallWeaponLevel ? ` (weapon ${latest.townHallWeaponLevel})` : ""}`}
          />
          <Stat label="Experience" value={`Lv ${latest.expLevel}`} />
          <Stat label="Trophies" value={`${latest.trophies} (best ${latest.bestTrophies})`} />
          <Stat label="League" value={latest.leagueName ?? "Unranked"} />
          <Stat label="War stars" value={String(latest.warStars)} />
          <Stat label="Attack / Defense wins" value={`${latest.attackWins} / ${latest.defenseWins}`} />
          <Stat label="Clan" value={latest.clanName ? `${latest.clanName} (${latest.clanRole ?? "member"})` : "None"} />
          <Stat label="Capital contributions" value={String(latest.clanCapitalContributions)} />
        </div>
      </div>

      {lastSync && !lastSync.success && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          Most recent sync failed: {lastSync.message}.{" "}
          <Link href="/sync" className="underline">
            See sync status
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Army/hero tracking"
          value={`${pendingUnitCount} of ${allUnits.length} units below cap`}
          href="/plan"
          cta="View upgrade plan"
        />
        <SummaryCard
          title="Buildings tracked"
          value={`${buildingCount} building groups`}
          href="/data/buildings"
          cta="Manage buildings"
        />
        <SummaryCard
          title="Resources & items"
          value="Gold, elixir, magic items, Gold Pass"
          href="/data/resources"
          cta="Update now"
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-black/50 dark:text-white/50">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function SummaryCard({ title, value, href, cta }: { title: string; value: string; href: string; cta: string }) {
  return (
    <div className={cardClasses}>
      <h2 className="text-sm font-medium text-black/60 dark:text-white/60">{title}</h2>
      <p className="mt-1 mb-3">{value}</p>
      <Link href={href} className="text-sm underline">
        {cta}
      </Link>
    </div>
  );
}
