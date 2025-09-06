-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "price" REAL NOT NULL,
    "promoPrice" REAL,
    "forfaitPrice" REAL,
    "forfaitPromo" REAL,
    "duration" INTEGER NOT NULL,
    "benefits" TEXT,
    "process" TEXT,
    "recommendations" TEXT,
    "contraindications" TEXT,
    "mainImage" TEXT,
    "gallery" TEXT,
    "videoUrl" TEXT,
    "canBeOption" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Service" ("active", "createdAt", "description", "duration", "forfaitPrice", "forfaitPromo", "id", "name", "price", "promoPrice", "updatedAt") SELECT "active", "createdAt", "description", "duration", "forfaitPrice", "forfaitPromo", "id", "name", "price", "promoPrice", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
