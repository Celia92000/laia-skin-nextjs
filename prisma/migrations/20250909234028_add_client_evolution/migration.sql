-- CreateTable
CREATE TABLE "ClientEvolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "serviceName" TEXT NOT NULL,
    "sessionDate" DATETIME NOT NULL,
    "beforePhoto" TEXT,
    "afterPhoto" TEXT,
    "videoUrl" TEXT,
    "improvements" TEXT,
    "clientFeedback" TEXT,
    "adminNotes" TEXT,
    "skinAnalysis" TEXT,
    "treatedAreas" TEXT,
    "productsUsed" TEXT,
    "hydrationLevel" INTEGER,
    "elasticity" INTEGER,
    "pigmentation" INTEGER,
    "wrinkleDepth" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientEvolution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
