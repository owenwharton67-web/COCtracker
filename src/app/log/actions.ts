"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function optionalNum(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalStr(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  return raw === "" ? null : raw;
}

export async function addUpgradeLogAction(formData: FormData) {
  const itemType = String(formData.get("itemType") ?? "").trim();
  const itemName = String(formData.get("itemName") ?? "").trim();
  const fromLevel = Number(formData.get("fromLevel"));
  const toLevel = Number(formData.get("toLevel"));
  if (!itemType || !itemName || !Number.isFinite(fromLevel) || !Number.isFinite(toLevel)) return;

  await prisma.upgradeLog.create({
    data: {
      itemType,
      itemName,
      fromLevel,
      toLevel,
      goldCost: optionalNum(formData, "goldCost"),
      elixirCost: optionalNum(formData, "elixirCost"),
      darkElixirCost: optionalNum(formData, "darkElixirCost"),
      oreCost: optionalNum(formData, "oreCost"),
      oreType: optionalStr(formData, "oreType"),
      durationMinutes: optionalNum(formData, "durationMinutes"),
      usedMagicItem: optionalStr(formData, "usedMagicItem"),
    },
  });

  revalidatePath("/log");
  revalidatePath("/plan");
}

export async function deleteUpgradeLogAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await prisma.upgradeLog.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/log");
  revalidatePath("/plan");
}
