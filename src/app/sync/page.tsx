import { prisma } from "@/lib/db";
import {
  cardClasses,
  cardHeaderClasses,
  buttonClasses,
  badgeClasses,
  emptyStateClasses,
  pageHeaderTitleClasses,
  pageHeaderSubtextClasses,
} from "@/components/ui";
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
      <div>
        <h1 className={pageHeaderTitleClasses}>Sync status</h1>
        <p className={pageHeaderSubtextClasses}>
          The scheduled job hits <code className="text-accent">/api/cron/sync</code> every ~3 minutes (see README
          for how to wire that up for your deployment).
        </p>
      </div>

      <div className={cardClasses}>
        {!configured && (
          <p className="text-sm text-danger mb-4">
            COC_PLAYER_TAG and/or COC_API_TOKEN aren&apos;t set yet - a sync will fail until they are.
          </p>
        )}
        <form action={triggerSyncAction}>
          <button type="submit" className={buttonClasses}>
            Sync now
          </button>
        </form>
      </div>

      <div className={cardClasses}>
        <h2 className={cardHeaderClasses + " mb-3"}>Recent sync attempts</h2>
        {logs.length === 0 ? (
          <p className={emptyStateClasses}>No sync attempts recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {logs.map((log) => (
              <li key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  <span className={badgeClasses(log.success ? "success" : "danger")}>
                    {log.success ? "OK" : `Failed${log.statusCode ? ` ${log.statusCode}` : ""}`}
                  </span>
                  <span className="text-muted">{log.message}</span>
                </div>
                <span className="shrink-0 text-faint">{new Date(log.ranAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
