"use server";

import { revalidatePath } from "next/cache";
import { importSnapshot } from "@/lib/data-transfer";
import { looksLikeGameExport, importGameExport, applyDataIdNames, type UnresolvedEntry } from "@/lib/game-export";

export interface ImportState {
  status: "idle" | "ok" | "error";
  message: string;
  unresolved?: UnresolvedEntry[];
}

function revalidateAll() {
  revalidatePath("/data/import");
  revalidatePath("/data/resources");
  revalidatePath("/data/buildings");
  revalidatePath("/");
  revalidatePath("/plan");
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
    if (looksLikeGameExport(parsed)) {
      const result = await importGameExport(parsed as Record<string, unknown>);
      revalidateAll();
      if (result.unresolved.length > 0) {
        return {
          status: "ok",
          message: `Applied ${result.resolvedCount} known buildings/traps. ${result.unresolved.length} unrecognized type(s) below need a name (once) before they're applied too.`,
          unresolved: result.unresolved,
        };
      }
      return { status: "ok", message: `Applied ${result.resolvedCount} buildings/traps from your village export.` };
    }

    const { imported } = await importSnapshot(parsed);
    revalidateAll();
    return { status: "ok", message: `Imported: ${imported.join(", ")}.` };
  } catch (err) {
    return { status: "error", message: (err as Error).message };
  }
}

export async function nameDataIdsAction(_prevState: ImportState, formData: FormData): Promise<ImportState> {
  const payloadRaw = String(formData.get("payload") ?? "");
  let entries: UnresolvedEntry[];
  try {
    entries = JSON.parse(payloadRaw);
  } catch {
    return { status: "error", message: "Something went wrong holding onto the unresolved list - try importing again." };
  }

  const named = entries
    .map((entry) => {
      const name = String(formData.get(`name_${entry.dataId}`) ?? "").trim();
      return name ? { ...entry, name } : null;
    })
    .filter((e): e is UnresolvedEntry & { name: string } => e !== null);

  if (named.length === 0) {
    return { status: "error", message: "Name at least one before saving - blank ones are left for later." };
  }

  await applyDataIdNames(named);
  revalidateAll();

  const remaining = entries.length - named.length;
  return {
    status: "ok",
    message:
      remaining > 0
        ? `Saved ${named.length} name(s). ${remaining} left unnamed - re-import the same export to name the rest.`
        : `Saved ${named.length} name(s) - applied, and remembered for every future export.`,
  };
}
