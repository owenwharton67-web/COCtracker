"use client";

import { useActionState } from "react";
import { importDataAction, nameDataIdsAction, type ImportState } from "./actions";
import { buttonClasses, badgeClasses, inputClasses, labelClasses } from "@/components/ui";

const initialState: ImportState = { status: "idle", message: "" };

const PLACEHOLDER = `{
  "resources": {
    "gold": 3200000,
    "elixir": 2800000,
    "darkElixir": 15000,
    "buildersAvailable": 1,
    "builderTotalCount": 6,
    "labBusy": true
  },
  "buildings": [
    { "type": "Gold Mine", "level": 15, "count": 4, "capLevel": 16 },
    { "type": "Cannon", "level": 21, "count": 2 }
  ],
  "magicItems": { "rune_of_building": 2, "book_of_heroes": 1 },
  "goldPass": { "active": true, "purchased": true, "tier": 12 }
}

...or paste Clash of Clans' own in-game village-export JSON directly - it's
auto-detected and handled differently (see the note below the box).`;

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importDataAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <textarea
          name="json"
          rows={14}
          spellCheck={false}
          placeholder={PLACEHOLDER}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-mono text-text placeholder:text-faint/70 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className={buttonClasses}>
            {pending ? "Importing..." : "Import"}
          </button>
          {!pending && state.status === "ok" && <span className={badgeClasses("success")}>{state.message}</span>}
          {!pending && state.status === "error" && <span className={badgeClasses("danger")}>{state.message}</span>}
        </div>
      </form>

      {state.unresolved && state.unresolved.length > 0 && <NameUnknownIds entries={state.unresolved} />}
    </div>
  );
}

function NameUnknownIds({ entries }: { entries: NonNullable<ImportState["unresolved"]> }) {
  const [state, formAction, pending] = useActionState(nameDataIdsAction, initialState);
  const payload = JSON.stringify(entries);

  return (
    <form action={formAction} className="rounded-xl border border-accent/30 bg-accent-soft/30 p-4 space-y-3">
      <input type="hidden" name="payload" value={payload} />
      <h3 className="text-sm font-medium text-text">Name these to finish applying your export</h3>
      <p className="text-xs text-muted">
        These IDs from your export aren&apos;t recognized yet - Supercell doesn&apos;t publish what they mean.
        Type what each one actually is in your village (check in-game if unsure) and it&apos;s remembered for every
        future export.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {entries.map((entry) => (
          <div key={entry.dataId}>
            <label className={labelClasses}>
              {entry.category === "TRAP" ? "Trap" : "Building"} - Lv{entry.level}, &times;{entry.count} (id {entry.dataId})
            </label>
            <input
              type="text"
              name={`name_${entry.dataId}`}
              placeholder="e.g. Inferno Tower"
              className={inputClasses}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClasses}>
          {pending ? "Saving..." : "Save names"}
        </button>
        {!pending && state.status === "ok" && <span className={badgeClasses("success")}>{state.message}</span>}
        {!pending && state.status === "error" && <span className={badgeClasses("danger")}>{state.message}</span>}
      </div>
    </form>
  );
}
