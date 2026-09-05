import Link from "next/link";
import { prisma } from "@/lib/db";
import { BUILDING_CATALOG, buildingGroup, type BuildingGroup } from "@/data/building-catalog";
import {
  cardClasses,
  cardHeaderClasses,
  inputClasses,
  labelClasses,
  secondaryButtonClasses,
  dangerLinkClasses,
  badgeClasses,
  emptyStateClasses,
  pageHeaderTitleClasses,
  pageHeaderSubtextClasses,
  sectionLabelClasses,
} from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { addBuildingGroupAction, updateBuildingGroupAction, deleteBuildingGroupAction } from "./actions";

export const dynamic = "force-dynamic";

const GROUP_LABEL: Record<BuildingGroup, string> = {
  RESOURCE: "Resources",
  ARMY: "Army",
  DEFENSE: "Defense",
  TRAP: "Traps",
  WALL: "Walls",
  OTHER: "Other",
};

export default async function BuildingsPage() {
  const buildings = await prisma.buildingInstance.findMany({
    where: { village: "home" },
    orderBy: [{ buildingType: "asc" }, { level: "asc" }],
  });

  const byGroup = new Map<string, typeof buildings>();
  for (const b of buildings) {
    const g = buildingGroup(b.buildingType);
    byGroup.set(g, [...(byGroup.get(g) ?? []), b]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageHeaderTitleClasses}>Buildings</h1>
        <p className={pageHeaderSubtextClasses}>
          The API exposes no building data beyond the Town Hall&apos;s own level - every row here is entered by
          hand. Group by (type, level): &quot;4 Gold Mines at level 14&quot; is one row, not four. Set the cap
          level from the in-game upgrade button (&quot;Lvl X/Y&quot; or &quot;MAX&quot;) so the plan knows when a
          group is actually maxed. Adding many at once? Use{" "}
          <Link href="/data/import" className="text-accent hover:underline">
            Import / export
          </Link>{" "}
          instead.
        </p>
      </div>

      <ActionForm action={addBuildingGroupAction} buttonLabel="Save group" className={cardClasses}>
        <h2 className={cardHeaderClasses + " mb-3"}>Add / update a group</h2>
        <div className="grid sm:grid-cols-4 gap-4">
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
        </div>
      </ActionForm>

      {buildings.length === 0 ? (
        <div className={cardClasses}>
          <p className={emptyStateClasses}>Nothing tracked yet - add a group above, or bulk-import.</p>
        </div>
      ) : (
        [...byGroup.entries()].map(([group, rows]) => (
          <div key={group}>
            <h2 className={sectionLabelClasses + " mb-2"}>{GROUP_LABEL[group as BuildingGroup] ?? group}</h2>
            <div className="space-y-2">
              {rows.map((b) => {
                const maxed = b.capLevel != null && b.level >= b.capLevel;
                return (
                  <form key={b.id} action={updateBuildingGroupAction} className={cardClasses + " !p-4 grid sm:grid-cols-6 gap-3 items-end"}>
                    <input type="hidden" name="id" value={b.id} />
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-text">{b.buildingType}</div>
                        <div className="text-xs text-faint">
                          &times;{b.count} at level {b.level}
                        </div>
                      </div>
                      {b.capLevel != null && (
                        <span className={maxed ? badgeClasses("success") : badgeClasses()}>
                          {maxed ? "Maxed" : `${b.capLevel - b.level} to go`}
                        </span>
                      )}
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
                      <button type="submit" formAction={deleteBuildingGroupAction} className={dangerLinkClasses}>
                        Remove
                      </button>
                    </div>
                  </form>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
