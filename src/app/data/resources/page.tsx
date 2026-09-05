import { prisma } from "@/lib/db";
import { MAGIC_ITEMS } from "@/data/magic-items";
import {
  cardClasses,
  cardHeaderClasses,
  inputClasses,
  labelClasses,
  pageHeaderTitleClasses,
  pageHeaderSubtextClasses,
  dividerClasses,
} from "@/components/ui";
import { Toggle } from "@/components/toggle";
import { ActionForm } from "@/components/action-form";
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
      <div>
        <h1 className={pageHeaderTitleClasses}>Resources & items</h1>
        <p className={pageHeaderSubtextClasses}>
          None of this is visible to the Clash of Clans API - it&apos;s entered by hand. Update it whenever it
          drifts noticeably from reality; the upgrade plan reads whatever is here. Prefer bulk edits? Use{" "}
          <a href="/data/import" className="text-accent hover:underline">
            Import / export
          </a>{" "}
          instead.
        </p>
      </div>

      <ActionForm action={updateResourcesAction} buttonLabel="Save resources" className={cardClasses}>
        <h2 className={cardHeaderClasses + " mb-3"}>Resources on hand</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Gold" name="gold" defaultValue={resources?.gold} />
          <Field label="Elixir" name="elixir" defaultValue={resources?.elixir} />
          <Field label="Dark Elixir" name="darkElixir" defaultValue={resources?.darkElixir} />
          <Field label="Shiny Ore" name="shinyOre" defaultValue={resources?.shinyOre} />
          <Field label="Glowy Ore" name="glowyOre" defaultValue={resources?.glowyOre} />
          <Field label="Starry Ore" name="starryOre" defaultValue={resources?.starryOre} />
          <Field label="Gems" name="gems" defaultValue={resources?.gems} />
          <Field label="Builders free" name="buildersAvailable" defaultValue={resources?.buildersAvailable ?? 5} />
          <Field
            label="Builders total (huts owned)"
            name="builderTotalCount"
            defaultValue={resources?.builderTotalCount ?? 5}
          />
        </div>
        <div className={dividerClasses + " pt-1 mt-4"}>
          <div className="grid sm:grid-cols-2 gap-x-6 pt-3">
            <Toggle name="labBusy" label="Laboratory busy" description="Currently researching something" defaultChecked={resources?.labBusy} />
            <Toggle
              name="petHouseBusy"
              label="Pet House busy"
              description="Currently upgrading a pet"
              defaultChecked={resources?.petHouseBusy}
            />
          </div>
        </div>
      </ActionForm>

      <ActionForm action={updateMagicItemsAction} buttonLabel="Save inventory" className={cardClasses}>
        <h2 className={cardHeaderClasses + " mb-3"}>Magic item inventory</h2>
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
      </ActionForm>

      <ActionForm action={updateGoldPassAction} buttonLabel="Save Gold Pass" className={cardClasses}>
        <h2 className={cardHeaderClasses + " mb-3"}>Gold Pass</h2>
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
        <div className={dividerClasses + " pt-1 mt-4"}>
          <div className="grid sm:grid-cols-2 gap-x-6 pt-3">
            <Toggle name="purchased" label="Purchased this season" defaultChecked={goldPass?.purchased} />
            <Toggle name="active" label="Season currently active" defaultChecked={goldPass?.active} />
          </div>
        </div>
      </ActionForm>
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
