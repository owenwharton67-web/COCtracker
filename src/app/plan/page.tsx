import Link from "next/link";
import { buildUpgradePlan } from "@/lib/optimizer/engine";
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

export const dynamic = "force-dynamic";

const CURRENCY_LABEL: Record<string, string> = {
  GOLD: "Gold",
  ELIXIR: "Elixir",
  DARK_ELIXIR: "Dark Elixir",
  ORE: "Ore",
};

export default async function PlanPage() {
  const plan = await buildUpgradePlan();

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

      <div className="flex flex-wrap gap-3">
        <MiniStat label="Builders free" value={`${plan.summary.buildersFree}/${plan.summary.buildersTotal}`} />
        <MiniStat label="Lab" value={plan.summary.labFree ? "Free" : "Busy"} />
        <MiniStat label="Units below cap" value={String(plan.summary.totalPendingUnits)} />
        <MiniStat label="Buildings below cap" value={String(plan.summary.totalPendingBuildings)} />
      </div>

      <Section
        title="Do now"
        description="Affordable with what you have on hand, and a builder/lab/altar slot is free."
        candidates={plan.affordableNow}
        emptyMessage="Nothing is both affordable and has a free slot right now - check Resources & items, or see Queued next below."
        tone="accent"
      />

      <Section
        title="Queued next"
        description="Ranked and ready, but blocked on resources on hand or a busy slot."
        candidates={plan.queuedNext}
        emptyMessage="Nothing queued."
      />

      {plan.blockedOnData.length > 0 && (
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
