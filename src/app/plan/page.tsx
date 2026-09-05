import { buildUpgradePlan } from "@/lib/optimizer/engine";
import { cardClasses } from "@/components/ui";
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
      <div className={cardClasses}>
        <h1 className="text-lg font-semibold mb-2">Upgrade plan</h1>
        <p className="text-sm text-black/70 dark:text-white/70">
          Ranked by strategic weight, then by cost/time efficiency (see <code>src/lib/optimizer/heuristic.ts</code>).
          Costs marked <em>approx.</em> come from a generic curve, not Supercell&apos;s real numbers (see the
          disclaimer in <code>src/data/cost-model.ts</code>) - log the real value at <a href="/log" className="underline">/log</a> once
          and it becomes exact from then on.
        </p>
        <div className="mt-3 text-xs text-black/50 dark:text-white/50">
          {plan.summary.buildersFree}/{plan.summary.buildersTotal} builders free · Lab {plan.summary.labFree ? "free" : "busy"} ·{" "}
          {plan.summary.totalPendingUnits} units and {plan.summary.totalPendingBuildings} building groups below cap
        </div>
      </div>

      <Section
        title="Do now"
        description="Affordable with what you have on hand, and a builder/lab/altar slot is free."
        candidates={plan.affordableNow}
        emptyMessage="Nothing is both affordable and has a free slot right now - check Resources & items, or see Queued next below."
      />

      <Section
        title="Queued next"
        description="Ranked and ready, but blocked on resources on hand or a busy slot."
        candidates={plan.queuedNext}
        emptyMessage="Nothing queued."
      />

      {plan.blockedOnData.length > 0 && (
        <div className={cardClasses}>
          <h2 className="font-medium mb-2">Missing cap level</h2>
          <p className="text-sm text-black/60 dark:text-white/60 mb-3">
            These building groups don&apos;t have a cap level set, so it&apos;s unknown whether they&apos;re
            already maxed for your Town Hall. Set it on the{" "}
            <a href="/data/buildings" className="underline">
              Buildings
            </a>{" "}
            page.
          </p>
          <ul className="text-sm space-y-1">
            {plan.blockedOnData.map((c, i) => (
              <li key={i}>{c.itemName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  candidates,
  emptyMessage,
}: {
  title: string;
  description: string;
  candidates: UpgradeCandidate[];
  emptyMessage: string;
}) {
  return (
    <div className={cardClasses}>
      <h2 className="font-medium">{title}</h2>
      <p className="text-sm text-black/60 dark:text-white/60 mb-3">{description}</p>
      {candidates.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">{emptyMessage}</p>
      ) : (
        <ol className="space-y-2">
          {candidates.map((c, i) => (
            <li key={i} className="border-t border-black/10 dark:border-white/10 pt-2 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                <span className="font-medium">
                  {c.itemName} <span className="text-black/50 dark:text-white/50">Lv{c.fromLevel}→{c.toLevel}</span>
                </span>
                <span className="text-black/70 dark:text-white/70">
                  {c.amount.toLocaleString()} {CURRENCY_LABEL[c.currency]}
                  {c.minutes > 0 ? ` · ${formatMinutes(c.minutes)}` : ""}
                  {!c.costIsExact && <span className="text-black/40 dark:text-white/40"> (approx.)</span>}
                </span>
              </div>
              <div className="text-xs text-black/50 dark:text-white/50">{c.reasons.join(" · ")}</div>
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
