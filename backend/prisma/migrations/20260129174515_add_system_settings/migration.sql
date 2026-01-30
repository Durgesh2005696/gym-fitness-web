-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "clientPrice" REAL NOT NULL DEFAULT 6000,
    "trainerPrice" REAL NOT NULL DEFAULT 659,
    "subscriptionDuration" INTEGER NOT NULL DEFAULT 30,
    "qrCode" TEXT,
    "updatedAt" DATETIME NOT NULL
);
