"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function num(formData: FormData, key: string): number {
  const parsed = Number(formData.get(key));
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalNum(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function addBuildingGroupAction(formData: FormData) {
  const buildingType = String(formData.get("buildingType") ?? "").trim();
  if (!buildingType) return;

  const level = num(formData, "level");
  const count = num(formData, "count");
  const capLevel = optionalNum(formData, "capLevel");

  await prisma.buildingInstance.upsert({
    where: { buildingType_level_village: { buildingType, level, village: "home" } },
    create: { buildingType, level, count, capLevel, village: "home" },
    update: { count, capLevel },
  });

  revalidatePath("/data/buildings");
  revalidatePath("/plan");
}

export async function updateBuildingGroupAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  await prisma.buildingInstance.update({
    where: { id },
    data: {
      count: num(formData, "count"),
      capLevel: optionalNum(formData, "capLevel"),
    },
  });

  revalidatePath("/data/buildings");
  revalidatePath("/plan");
}

export async function deleteBuildingGroupAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await prisma.buildingInstance.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/data/buildings");
  revalidatePath("/plan");
}
