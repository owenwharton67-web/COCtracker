"use client";

import { useActionState } from "react";
import { importDataAction, type ImportState } from "./actions";
import { buttonClasses, badgeClasses } from "@/components/ui";

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
}`;

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importDataAction, initialState);

  return (
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
        {state.status === "ok" && <span className={badgeClasses("success")}>{state.message}</span>}
        {state.status === "error" && <span className={badgeClasses("danger")}>{state.message}</span>}
      </div>
    </form>
  );
}
