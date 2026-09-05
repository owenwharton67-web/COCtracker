import { prisma } from "@/lib/db";
import { MAGIC_ITEMS } from "@/data/magic-items";
import {
  cardClasses,
  cardHeaderClasses,
  inputClasses,
  labelClasses,
  buttonClasses,
  dangerLinkClasses,
  emptyStateClasses,
  pageHeaderTitleClasses,
  pageHeaderSubtextClasses,
} from "@/components/ui";
import { addUpgradeLogAction, deleteUpgradeLogAction } from "./actions";

export const dynamic = "force-dynamic";

const ITEM_TYPES = ["BUILDING", "WALL", "TROOP", "SPELL", "HERO", "HERO_EQUIPMENT", "PET"];

export default async function UpgradeLogPage() {
  const entries = await prisma.upgradeLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageHeaderTitleClasses}>Upgrade log</h1>
        <p className={pageHeaderSubtextClasses}>
          Log the real cost/time the game shows you when you queue an upgrade. Any upgrade with a matching logged
          entry (same item, same level jump) uses this exact number in the plan - taking priority over both the
          verified game-data table and the approximation.
        </p>
      </div>

      <form action={addUpgradeLogAction} className={cardClasses + " grid sm:grid-cols-4 gap-4 items-end"}>
        <div>
          <label className={labelClasses}>Type</label>
          <select name="itemType" className={inputClasses} required>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClasses}>Item name</label>
          <input type="text" name="itemName" className={inputClasses} required placeholder="e.g. Barbarian King" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClasses}>From level</label>
            <input type="number" name="fromLevel" className={inputClasses} required />
          </div>
          <div>
            <label className={labelClasses}>To level</label>
            <input type="number" name="toLevel" className={inputClasses} required />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Gold cost</label>
          <input type="number" name="goldCost" className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Elixir cost</label>
          <input type="number" name="elixirCost" className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Dark Elixir cost</label>
          <input type="number" name="darkElixirCost" className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Duration (minutes)</label>
          <input type="number" name="durationMinutes" className={inputClasses} />
        </div>

        <div>
          <label className={labelClasses}>Ore cost</label>
          <input type="number" name="oreCost" className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Ore type</label>
          <select name="oreType" className={inputClasses} defaultValue="">
            <option value="">n/a</option>
            <option value="shiny">Shiny</option>
            <option value="glowy">Glowy</option>
            <option value="starry">Starry</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClasses}>Finished with a magic item?</label>
          <select name="usedMagicItem" className={inputClasses} defaultValue="">
            <option value="">No</option>
            {MAGIC_ITEMS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <button type="submit" className={buttonClasses}>
            Add log entry
          </button>
        </div>
      </form>

      <div className={cardClasses}>
        <h2 className={cardHeaderClasses + " mb-3"}>Recent entries</h2>
        {entries.length === 0 ? (
          <p className={emptyStateClasses}>Nothing logged yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {entries.map((entry) => (
              <li key={entry.id} className="py-2.5 flex items-center justify-between gap-4">
                <span className="text-text">
                  <span className="font-medium">{entry.itemName}</span>{" "}
                  <span className="text-faint">
                    Lv{entry.fromLevel}&rarr;{entry.toLevel} ·{" "}
                    {[
                      entry.goldCost != null ? `${entry.goldCost.toLocaleString()} gold` : null,
                      entry.elixirCost != null ? `${entry.elixirCost.toLocaleString()} elixir` : null,
                      entry.darkElixirCost != null ? `${entry.darkElixirCost.toLocaleString()} DE` : null,
                      entry.oreCost != null ? `${entry.oreCost.toLocaleString()} ${entry.oreType ?? ""} ore` : null,
                      entry.durationMinutes != null ? `${entry.durationMinutes}m` : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </span>
                <form action={deleteUpgradeLogAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button type="submit" className={dangerLinkClasses}>
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
