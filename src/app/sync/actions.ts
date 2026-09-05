"use server";

import { revalidatePath } from "next/cache";
import { runSync } from "@/lib/sync";

export async function triggerSyncAction() {
  await runSync();
  revalidatePath("/sync");
  revalidatePath("/");
}
