import { prisma } from "@/lib/db";
import { MAGIC_ITEMS } from "@/data/magic-items";
import { cardClasses, inputClasses, labelClasses, buttonClasses } from "@/components/ui";
import { updateResourcesAction, updateMagicItemsAction, updateGoldPassAction } from "./actions";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default async function ResourcesPage() {
  const [resources, magicItems, goldPass] = await Promise.all([
    prisma.resourceState.findUnique({ where: { id: 1 } }),
    prisma.magicItem.findMany(),
    prisma.goldPassState.findUnique({ where: { id: 1 } }),
  ]);

  const magicItemQty = new Map(magicItems.map((m) => [m.itemKey, m.quantity]));

  return (
    <div className="space-y-6">
      <p className="text-sm text-black/60 dark:text-white/60">
        None of this is exposed by the Clash of Clans API - it has to be entered by hand. Update it whenever it
        drifts noticeably from reality; the upgrade plan uses whatever is here.
      </p>

      <form action={updateResourcesAction} className={cardClasses + " space-y-4"}>
        <h2 className="font-medium">Resources on hand</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Gold" name="gold" defaultValue={resources?.gold} />
          <Field label="Elixir" name="elixir" defaultValue={resources?.elixir} />
          <Field label="Dark Elixir" name="darkElixir" defaultValue={resources?.darkElixir} />
          <Field label="Shiny Ore" name="shinyOre" defaultValue={resources?.shinyOre} />
          <Field label="Glowy Ore" name="glowyOre" defaultValue={resources?.glowyOre} />
          <Field label="Starry Ore" name="starryOre" defaultValue={resources?.starryOre} />
          <Field label="Gems" name="gems" defaultValue={resources?.gems} />
          <Field label="Builders free" name="buildersAvailable" defaultValue={resources?.buildersAvailable ?? 5} />
          <Field label="Builders total (huts owned)" name="builderTotalCount" defaultValue={resources?.builderTotalCount ?? 5} />
        </div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="labBusy" defaultChecked={resources?.labBusy} />
            Laboratory currently researching something
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="petHouseBusy" defaultChecked={resources?.petHouseBusy} />
            Pet House currently upgrading a pet
          </label>
        </div>
        <button type="submit" className={buttonClasses}>
          Save resources
        </button>
      </form>

      <form action={updateMagicItemsAction} className={cardClasses + " space-y-4"}>
        <h2 className="font-medium">Magic item inventory</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {MAGIC_ITEMS.map((item) => (
            <div key={item.key}>
              <label className={labelClasses} title={item.description}>
                {item.name}
              </label>
              <input
                type="number"
                min={0}
                name={item.key}
                defaultValue={magicItemQty.get(item.key) ?? 0}
                className={inputClasses}
              />
            </div>
          ))}
        </div>
        <button type="submit" className={buttonClasses}>
          Save inventory
        </button>
      </form>

      <form action={updateGoldPassAction} className={cardClasses + " space-y-4"}>
        <h2 className="font-medium">Gold Pass</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClasses}>Season name</label>
            <input type="text" name="seasonName" defaultValue={goldPass?.seasonName ?? ""} className={inputClasses} />
          </div>
          <Field label="Current tier" name="tier" defaultValue={goldPass?.tier ?? 0} />
          <div>
            <label className={labelClasses}>Season ends</label>
            <input
              type="date"
              name="seasonEndsAt"
              defaultValue={toDateInputValue(goldPass?.seasonEndsAt)}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="purchased" defaultChecked={goldPass?.purchased} />
            Gold Pass purchased this season
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={goldPass?.active} />
            Season currently active
          </label>
        </div>
        <button type="submit" className={buttonClasses}>
          Save Gold Pass
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: number | null }) {
  return (
    <div>
      <label className={labelClasses}>{label}</label>
      <input type="number" name={name} defaultValue={defaultValue ?? 0} className={inputClasses} />
    </div>
  );
}
