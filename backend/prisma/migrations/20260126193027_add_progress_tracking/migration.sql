-- CreateTable
CREATE TABLE "ClientProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "weight" REAL,
    "bodyFat" REAL,
    "chest" REAL,
    "waist" REAL,
    "hips" REAL,
    "arms" REAL,
    "thighs" REAL,
    "trainerNotes" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientProgress_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "photoType" TEXT NOT NULL,
    "trainerComment" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressPhoto_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "waterIntake" REAL NOT NULL DEFAULT 0,
    "workoutCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mealsCompleted" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyActivity_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "energyLevel" INTEGER NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "motivation" INTEGER NOT NULL,
    "soreness" INTEGER NOT NULL,
    "notes" TEXT,
    "trainerReply" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyFeedback_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
