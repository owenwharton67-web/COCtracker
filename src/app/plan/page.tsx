import Link from "next/link";
import { buildUpgradePlan } from "@/lib/optimizer/engine";
import { estimateTimeToMax } from "@/lib/optimizer/eta";
import {
  cardClasses,
  cardHeaderClasses,
  currencyBadgeClasses,
  badgeClasses,
  emptyStateClasses,
  pageHeaderTitleClasses,
  pageHeaderSubtextClasses,
  sectionLabelClasses,
} from "@/components/ui";
import type { UpgradeCandidate } from "@/lib/optimizer/types";
import type { TimeToMaxEstimate } from "@/lib/optimizer/eta";

export const dynamic = "force-dynamic";

const CURRENCY_LABEL: Record<string, string> = {
  GOLD: "Gold",
  ELIXIR: "Elixir",
  DARK_ELIXIR: "Dark Elixir",
  ORE: "Ore",
};

type TabKey = "ALL" | "HEROES" | "ARMY" | "BUILDINGS";

const TABS: { key: TabKey; label: string; types: string[] | null }[] = [
  { key: "ALL", label: "All", types: null },
  { key: "HEROES", label: "Heroes & equipment", types: ["HERO", "HERO_EQUIPMENT"] },
  { key: "ARMY", label: "Troops, spells & pets", types: ["TROOP", "SIEGE_MACHINE", "SPELL", "PET"] },
  { key: "BUILDINGS", label: "Buildings & walls", types: ["BUILDING", "WALL"] },
];

function matchesTab(candidate: UpgradeCandidate, tab: TabKey): boolean {
  const types = TABS.find((t) => t.key === tab)?.types;
  return !types || types.includes(candidate.itemType);
}

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const params = await searchParams;
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const activeTab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : "ALL";

  const [plan, eta] = await Promise.all([buildUpgradePlan(), estimateTimeToMax()]);
  const affordableNow = plan.affordableNow.filter((c) => matchesTab(c, activeTab));
  const queuedNext = plan.queuedNext.filter((c) => matchesTab(c, activeTab));

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageHeaderTitleClasses}>Upgrade plan</h1>
        <p className={pageHeaderSubtextClasses}>
          Ranked by strategic importance, then cost/time efficiency. Amounts marked <em>approx.</em> are estimates,
          not Supercell&apos;s real numbers - <Link href="/log" className="text-accent hover:underline">log the real cost</Link> once
          and that item uses your exact number from then on.
        </p>
      </div>

      {eta && eta.overallDays > 0 && <EtaCard eta={eta} />}

      <div className="flex flex-wrap gap-3">
        <MiniStat label="Builders free" value={`${plan.summary.buildersFree}/${plan.summary.buildersTotal}`} />
        <MiniStat label="Lab" value={plan.summary.labFree ? "Free" : "Busy"} />
        <MiniStat label="Units below cap" value={String(plan.summary.totalPendingUnits)} />
        <MiniStat label="Buildings below cap" value={String(plan.summary.totalPendingBuildings)} />
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "ALL" ? "/plan" : `/plan?tab=${tab.key}`}
            className={
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
              (activeTab === tab.key ? "bg-accent text-on-accent" : "text-muted hover:text-text hover:bg-surface-hover")
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Section
        title="Do now"
        description="Affordable with what you have on hand, and a builder/lab/altar slot is free."
        candidates={affordableNow}
        emptyMessage="Nothing here is both affordable and has a free slot right now."
        tone="accent"
      />

      <Section
        title="Queued next"
        description="Ranked and ready, but blocked on resources on hand or a busy slot."
        candidates={queuedNext}
        emptyMessage="Nothing queued in this category."
      />

      {activeTab === "ALL" && plan.blockedOnData.length > 0 && (
        <div className={cardClasses}>
          <h2 className={cardHeaderClasses}>Missing cap level</h2>
          <p className="text-sm text-muted mb-3">
            These building groups don&apos;t have a cap level set, so it&apos;s unknown whether they&apos;re
            already maxed for your Town Hall. Set it on the{" "}
            <Link href="/data/buildings" className="text-accent hover:underline">
              Buildings
            </Link>{" "}
            page.
          </p>
          <ul className="text-sm space-y-1 text-muted">
            {plan.blockedOnData.map((c, i) => (
              <li key={i}>{c.itemName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const BOTTLENECK_LABEL: Record<TimeToMaxEstimate["bottleneck"], string> = {
  BUILDER: "your builders",
  LAB: "the Laboratory / Pet House queue",
  HERO: "your slowest hero",
  NONE: "nothing",
};

function EtaCard({ eta }: { eta: TimeToMaxEstimate }) {
  const bottleneckDetail =
    eta.bottleneck === "HERO" && eta.slowestHero ? ` (${eta.slowestHero})` : "";

  return (
    <div className={cardClasses + " border-accent/30 bg-linear-to-br from-surface to-accent-soft/40"}>
      <div className={sectionLabelClasses}>Time to fully max, back-to-back</div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl font-semibold text-text">{formatDays(eta.overallDays)}</span>
        <span className="text-sm text-muted">
          bottlenecked by {BOTTLENECK_LABEL[eta.bottleneck]}
          {bottleneckDetail}
        </span>
      </div>
      <p className="text-xs text-faint mt-2 max-w-xl">
        This assumes resources are never the limiting factor (we don&apos;t track your income rate) - it&apos;s a
        best-case floor, not a promised date. If it&apos;s much longer than you expected, that track (builders, Lab,
        or a hero) is your real constraint, not gold/elixir.
      </p>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span>Builders: {formatDays(eta.builderDays)}</span>
        <span>Lab/Pet House: {formatDays(eta.labDays)}</span>
        <span>Heroes: {formatDays(eta.heroDays)}</span>
      </div>
    </div>
  );
}

function formatDays(days: number): string {
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
  if (days < 60) return `${Math.round(days)}d`;
  const months = days / 30;
  if (months < 24) return `${months.toFixed(1)}mo`;
  return `${(days / 365).toFixed(1)}yr`;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
      <span className="text-faint">{label}</span> <span className="text-text font-medium">{value}</span>
    </div>
  );
}

function Section({
  title,
  description,
  candidates,
  emptyMessage,
  tone,
}: {
  title: string;
  description: string;
  candidates: UpgradeCandidate[];
  emptyMessage: string;
  tone?: "accent";
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h2 className={sectionLabelClasses}>{title}</h2>
        {tone === "accent" && candidates.length > 0 && <span className={badgeClasses("accent")}>{candidates.length}</span>}
      </div>
      <p className="text-sm text-muted mb-3">{description}</p>
      {candidates.length === 0 ? (
        <div className={cardClasses}>
          <p className={emptyStateClasses}>{emptyMessage}</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {candidates.map((c, i) => (
            <li key={i} className={cardClasses + " !p-4"}>
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div>
                  <div className="text-sm font-medium text-text">
                    {c.itemName} <span className="text-faint font-normal">Lv{c.fromLevel}&rarr;{c.toLevel}</span>
                  </div>
                  <div className="text-xs text-faint mt-0.5">{c.reasons.join(" · ")}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={currencyBadgeClasses[c.currency] ? `${currencyBadgeClasses[c.currency]} rounded-full px-2.5 py-1 text-xs font-medium` : badgeClasses()}>
                    {c.amount.toLocaleString()} {CURRENCY_LABEL[c.currency]}
                  </span>
                  {c.minutes > 0 && <span className="text-xs text-muted">{formatMinutes(c.minutes)}</span>}
                  {!c.costIsExact && <span className="text-xs text-faint">approx.</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
