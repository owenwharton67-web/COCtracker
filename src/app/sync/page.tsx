import { prisma } from "@/lib/db";
import { cardClasses, buttonClasses } from "@/components/ui";
import { triggerSyncAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SyncStatusPage() {
  const logs = await prisma.syncLog.findMany({
    orderBy: { ranAt: "desc" },
    take: 30,
  });

  const configured = Boolean(process.env.COC_PLAYER_TAG?.trim() && process.env.COC_API_TOKEN?.trim());

  return (
    <div className="space-y-6">
      <div className={cardClasses}>
        <h1 className="text-lg font-semibold mb-2">Sync status</h1>
        <p className="text-sm text-black/70 dark:text-white/70 mb-4">
          The scheduled job hits <code>/api/cron/sync</code> every ~3 minutes (see README for how to wire that
          up for your deployment). Use this button to run one manually.
        </p>
        {!configured && (
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
            COC_PLAYER_TAG and/or COC_API_TOKEN aren&apos;t set in .env yet - a sync will fail until they are.
          </p>
        )}
        <form action={triggerSyncAction}>
          <button type="submit" className={buttonClasses}>
            Sync now
          </button>
        </form>
      </div>

      <div className={cardClasses}>
        <h2 className="text-sm font-medium text-black/60 dark:text-white/60 mb-3">Recent sync attempts</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50">No sync attempts recorded yet.</p>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="py-2 flex items-start justify-between gap-4">
                <div>
                  <span className={log.success ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {log.success ? "OK" : `FAILED${log.statusCode ? ` (${log.statusCode})` : ""}`}
                  </span>
                  <span className="ml-2 text-black/70 dark:text-white/70">{log.message}</span>
                </div>
                <span className="shrink-0 text-black/40 dark:text-white/40">
                  {new Date(log.ranAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
