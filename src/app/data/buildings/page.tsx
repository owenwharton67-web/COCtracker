import { prisma } from "@/lib/db";
import { BUILDING_CATALOG, buildingGroup } from "@/data/building-catalog";
import { cardClasses, inputClasses, labelClasses, buttonClasses, secondaryButtonClasses } from "@/components/ui";
import { addBuildingGroupAction, updateBuildingGroupAction, deleteBuildingGroupAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const buildings = await prisma.buildingInstance.findMany({
    where: { village: "home" },
    orderBy: [{ buildingType: "asc" }, { level: "asc" }],
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-black/60 dark:text-white/60">
        The CoC API exposes no building data at all beyond the Town Hall&apos;s own level - every row here is
        entered by hand. Group by (building type, level): e.g. &quot;4 Gold Mines at level 14&quot; is one row,
        not four. Set the cap level from the in-game upgrade button (&quot;Lvl X/Y&quot; or &quot;MAX&quot;) so
        the plan knows when a group is actually maxed.
      </p>

      <div className={cardClasses}>
        <h2 className="font-medium mb-3">Add / update a group</h2>
        <form action={addBuildingGroupAction} className="grid sm:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className={labelClasses}>Building type</label>
            <select name="buildingType" className={inputClasses} required>
              {BUILDING_CATALOG.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Level</label>
            <input type="number" name="level" min={1} className={inputClasses} required />
          </div>
          <div>
            <label className={labelClasses}>Count at this level</label>
            <input type="number" name="count" min={1} defaultValue={1} className={inputClasses} required />
          </div>
          <div>
            <label className={labelClasses}>Cap level (optional)</label>
            <input type="number" name="capLevel" min={1} className={inputClasses} />
          </div>
          <div className="sm:col-span-5">
            <button type="submit" className={buttonClasses}>
              Save group
            </button>
          </div>
        </form>
      </div>

      <div className={cardClasses}>
        <h2 className="font-medium mb-3">Tracked buildings</h2>
        {buildings.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50">Nothing tracked yet - add a group above.</p>
        ) : (
          <div className="space-y-2">
            {buildings.map((b) => (
              <form
                key={b.id}
                action={updateBuildingGroupAction}
                className="grid sm:grid-cols-6 gap-3 items-end border-t border-black/10 dark:border-white/10 pt-3 text-sm"
              >
                <input type="hidden" name="id" value={b.id} />
                <div className="sm:col-span-2">
                  <div className="font-medium">{b.buildingType}</div>
                  <div className="text-xs text-black/50 dark:text-white/50">
                    {buildingGroup(b.buildingType)} · level {b.level}
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Count</label>
                  <input type="number" name="count" min={1} defaultValue={b.count} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Cap level</label>
                  <input type="number" name="capLevel" min={1} defaultValue={b.capLevel ?? undefined} className={inputClasses} />
                </div>
                <div>
                  <button type="submit" className={secondaryButtonClasses}>
                    Update
                  </button>
                </div>
                <div>
                  <button type="submit" formAction={deleteBuildingGroupAction} className="text-xs text-red-600 dark:text-red-400 underline">
                    Remove
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
