-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResourceState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "elixir" INTEGER NOT NULL DEFAULT 0,
    "darkElixir" INTEGER NOT NULL DEFAULT 0,
    "shinyOre" INTEGER NOT NULL DEFAULT 0,
    "glowyOre" INTEGER NOT NULL DEFAULT 0,
    "starryOre" INTEGER NOT NULL DEFAULT 0,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "buildersAvailable" INTEGER NOT NULL DEFAULT 5,
    "builderTotalCount" INTEGER NOT NULL DEFAULT 5,
    "labBusy" BOOLEAN NOT NULL DEFAULT false,
    "petHouseBusy" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ResourceState" ("builderTotalCount", "buildersAvailable", "darkElixir", "elixir", "gems", "glowyOre", "gold", "id", "labBusy", "shinyOre", "starryOre", "updatedAt") SELECT "builderTotalCount", "buildersAvailable", "darkElixir", "elixir", "gems", "glowyOre", "gold", "id", "labBusy", "shinyOre", "starryOre", "updatedAt" FROM "ResourceState";
DROP TABLE "ResourceState";
ALTER TABLE "new_ResourceState" RENAME TO "ResourceState";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
