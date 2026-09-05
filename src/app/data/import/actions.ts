"use server";

import { revalidatePath } from "next/cache";
import { importSnapshot } from "@/lib/data-transfer";

export interface ImportState {
  status: "idle" | "ok" | "error";
  message: string;
}

export async function importDataAction(_prevState: ImportState, formData: FormData): Promise<ImportState> {
  const raw = String(formData.get("json") ?? "").trim();
  if (!raw) {
    return { status: "error", message: "Paste some JSON first." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { status: "error", message: `That's not valid JSON: ${(err as Error).message}` };
  }

  try {
    const { imported } = await importSnapshot(parsed);
    revalidatePath("/data/import");
    revalidatePath("/data/resources");
    revalidatePath("/data/buildings");
    revalidatePath("/plan");
    return { status: "ok", message: `Imported: ${imported.join(", ")}.` };
  } catch (err) {
    return { status: "error", message: (err as Error).message };
  }
}
