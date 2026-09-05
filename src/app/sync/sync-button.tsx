"use client";

import { useActionState } from "react";
import { triggerSyncAction, type SyncActionState } from "./actions";
import { buttonClasses, badgeClasses } from "@/components/ui";

const initialState: SyncActionState = { status: "idle", message: "" };

export function SyncButton() {
  const [state, formAction, pending] = useActionState(triggerSyncAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-3">
      <button type="submit" disabled={pending} className={buttonClasses}>
        {pending ? (
          <>
            <span className="h-3.5 w-3.5 rounded-full border-2 border-on-accent/40 border-t-on-accent animate-spin" />
            Syncing...
          </>
        ) : (
          "Sync now"
        )}
      </button>
      {!pending && state.status === "ok" && <span className={badgeClasses("success")}>{state.message}</span>}
      {!pending && state.status === "error" && <span className={badgeClasses("danger")}>{state.message}</span>}
    </form>
  );
}
