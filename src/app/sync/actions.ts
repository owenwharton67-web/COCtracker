"use server";

import { revalidatePath } from "next/cache";
import { runSync } from "@/lib/sync";

export interface SyncActionState {
  status: "idle" | "ok" | "error";
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by useActionState's action signature
export async function triggerSyncAction(_prevState: SyncActionState): Promise<SyncActionState> {
  const result = await runSync();
  revalidatePath("/sync");
  revalidatePath("/");
  revalidatePath("/plan");
  return { status: result.success ? "ok" : "error", message: result.message };
}
