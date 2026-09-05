"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MAGIC_ITEMS } from "@/data/magic-items";

function num(formData: FormData, key: string): number {
  const raw = formData.get(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function updateResourcesAction(formData: FormData) {
  await prisma.resourceState.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      gold: num(formData, "gold"),
      elixir: num(formData, "elixir"),
      darkElixir: num(formData, "darkElixir"),
      shinyOre: num(formData, "shinyOre"),
      glowyOre: num(formData, "glowyOre"),
      starryOre: num(formData, "starryOre"),
      gems: num(formData, "gems"),
      buildersAvailable: num(formData, "buildersAvailable"),
      builderTotalCount: num(formData, "builderTotalCount"),
      labBusy: formData.get("labBusy") === "on",
      petHouseBusy: formData.get("petHouseBusy") === "on",
    },
    update: {
      gold: num(formData, "gold"),
      elixir: num(formData, "elixir"),
      darkElixir: num(formData, "darkElixir"),
      shinyOre: num(formData, "shinyOre"),
      glowyOre: num(formData, "glowyOre"),
      starryOre: num(formData, "starryOre"),
      gems: num(formData, "gems"),
      buildersAvailable: num(formData, "buildersAvailable"),
      builderTotalCount: num(formData, "builderTotalCount"),
      labBusy: formData.get("labBusy") === "on",
      petHouseBusy: formData.get("petHouseBusy") === "on",
    },
  });
  revalidatePath("/data/resources");
  revalidatePath("/plan");
}

export async function updateMagicItemsAction(formData: FormData) {
  await Promise.all(
    MAGIC_ITEMS.map((item) =>
      prisma.magicItem.upsert({
        where: { itemKey: item.key },
        create: { itemKey: item.key, quantity: num(formData, item.key) },
        update: { quantity: num(formData, item.key) },
      }),
    ),
  );
  revalidatePath("/data/resources");
  revalidatePath("/plan");
}

export async function updateGoldPassAction(formData: FormData) {
  const seasonEndsAtRaw = String(formData.get("seasonEndsAt") ?? "").trim();
  const seasonEndsAt = seasonEndsAtRaw ? new Date(seasonEndsAtRaw) : null;

  await prisma.goldPassState.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      active: formData.get("active") === "on",
      purchased: formData.get("purchased") === "on",
      seasonName: String(formData.get("seasonName") ?? "") || null,
      tier: num(formData, "tier"),
      seasonEndsAt,
    },
    update: {
      active: formData.get("active") === "on",
      purchased: formData.get("purchased") === "on",
      seasonName: String(formData.get("seasonName") ?? "") || null,
      tier: num(formData, "tier"),
      seasonEndsAt,
    },
  });
  revalidatePath("/data/resources");
}
