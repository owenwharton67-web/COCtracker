import { exportSnapshot } from "@/lib/data-transfer";
import { cardClasses, cardHeaderClasses, cardSubtextClasses, secondaryButtonClasses, pageHeaderTitleClasses, pageHeaderSubtextClasses } from "@/components/ui";
import { ImportForm } from "./import-form";
import { ExportPreview } from "./export-preview";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const snapshot = await exportSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageHeaderTitleClasses}>Import / export</h1>
        <p className={pageHeaderSubtextClasses}>
          Everything on this page is data the Clash of Clans API can&apos;t see - resources on hand, building
          levels, magic items, Gold Pass. There&apos;s no automatic source for it (see the Overview page for why),
          so this is the fast way to set or update a lot of it at once instead of one form field at a time.
        </p>
      </div>

      <div className={cardClasses}>
        <h2 className={cardHeaderClasses}>Import</h2>
        <p className={cardSubtextClasses + " mb-3"}>
          Paste a JSON object with any of <code className="text-accent">resources</code>,{" "}
          <code className="text-accent">buildings</code>, <code className="text-accent">magicItems</code>, or{" "}
          <code className="text-accent">goldPass</code> - only the sections you include get updated. Building
          rows are matched by (type, level), so importing again with an updated count/capLevel just corrects
          that row rather than duplicating it.
        </p>
        <p className={cardSubtextClasses + " mb-3"}>
          You can also paste Clash of Clans&apos; own in-game village-export JSON directly - it&apos;s detected
          automatically and applies building/trap levels straight from it. The first time it sees a building type
          it doesn&apos;t recognize, it&apos;ll ask you to name it once; every export after that applies
          automatically.
        </p>
        <ImportForm />
      </div>

      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-1">
          <h2 className={cardHeaderClasses}>Export current data</h2>
          <a href="/api/export" download className={secondaryButtonClasses}>
            Download JSON
          </a>
        </div>
        <p className={cardSubtextClasses + " mb-3"}>
          A snapshot of everything above, exactly as this app currently has it. Handy as a backup, or to edit
          and re-import.
        </p>
        <ExportPreview json={JSON.stringify(snapshot, null, 2)} />
      </div>
    </div>
  );
}
