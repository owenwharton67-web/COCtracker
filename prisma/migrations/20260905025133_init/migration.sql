-- CreateTable
CREATE TABLE "PlayerSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "townHallLevel" INTEGER NOT NULL,
    "townHallWeaponLevel" INTEGER,
    "expLevel" INTEGER NOT NULL,
    "trophies" INTEGER NOT NULL,
    "bestTrophies" INTEGER NOT NULL,
    "warStars" INTEGER NOT NULL,
    "attackWins" INTEGER NOT NULL,
    "defenseWins" INTEGER NOT NULL,
    "builderHallLevel" INTEGER,
    "builderBaseTrophies" INTEGER,
    "bestBuilderBaseTrophies" INTEGER,
    "donations" INTEGER NOT NULL,
    "donationsReceived" INTEGER NOT NULL,
    "clanCapitalContributions" INTEGER NOT NULL,
    "leagueName" TEXT,
    "builderBaseLeagueName" TEXT,
    "clanTag" TEXT,
    "clanName" TEXT,
    "clanRole" TEXT,
    "warPreference" TEXT,
    "legendLeagueRank" INTEGER,
    "raw" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UnitLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "maxLevel" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BuildingInstance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buildingType" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "village" TEXT NOT NULL DEFAULT 'home',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResourceState" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MagicItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GoldPassState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "seasonName" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "seasonEndsAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UpgradeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemType" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "fromLevel" INTEGER NOT NULL,
    "toLevel" INTEGER NOT NULL,
    "goldCost" INTEGER,
    "elixirCost" INTEGER,
    "darkElixirCost" INTEGER,
    "oreCost" INTEGER,
    "oreType" TEXT,
    "durationMinutes" INTEGER,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "usedMagicItem" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "statusCode" INTEGER,
    "message" TEXT
);

-- CreateIndex
CREATE INDEX "PlayerSnapshot_fetchedAt_idx" ON "PlayerSnapshot"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UnitLevel_name_village_key" ON "UnitLevel"("name", "village");

-- CreateIndex
CREATE UNIQUE INDEX "BuildingInstance_buildingType_level_village_key" ON "BuildingInstance"("buildingType", "level", "village");

-- CreateIndex
CREATE UNIQUE INDEX "MagicItem_itemKey_key" ON "MagicItem"("itemKey");
