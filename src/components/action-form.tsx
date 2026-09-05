"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { buttonClasses, badgeClasses } from "@/components/ui";

export interface SaveState {
  status: "idle" | "ok" | "error";
  message: string;
}

export const initialSaveState: SaveState = { status: "idle", message: "" };

// Wraps a server action matching useActionState's (prevState, formData) =>
// state signature with a form that shows a spinner while saving and an
// inline confirmation/error afterward, instead of a silent revalidate.
export function ActionForm({
  action,
  buttonLabel = "Save",
  className,
  children,
}: {
  action: (prevState: SaveState, formData: FormData) => Promise<SaveState>;
  buttonLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialSaveState);

  return (
    <form action={formAction} className={className}>
      {children}
      <div className="flex items-center gap-3 mt-4">
        <button type="submit" disabled={pending} className={buttonClasses}>
          {pending ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-on-accent/40 border-t-on-accent animate-spin" />
              Saving...
            </>
          ) : (
            buttonLabel
          )}
        </button>
        {!pending && state.status === "ok" && <span className={badgeClasses("success")}>Saved</span>}
        {!pending && state.status === "error" && <span className={badgeClasses("danger")}>{state.message}</span>}
      </div>
    </form>
  );
}
