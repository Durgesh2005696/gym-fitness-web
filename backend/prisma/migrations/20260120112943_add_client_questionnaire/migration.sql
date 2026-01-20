-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "age" INTEGER,
    "height" REAL,
    "currentWeight" REAL,
    "currentWorkout" TEXT,
    "currentDiet" TEXT,
    "injuries" TEXT,
    "dietType" TEXT,
    "lactoseIntolerant" BOOLEAN DEFAULT false,
    "foodAllergies" TEXT,
    "workoutTime" TEXT,
    "weakParts" TEXT,
    "strongParts" TEXT,
    "isQuestionnaireFilled" BOOLEAN NOT NULL DEFAULT false,
    "dietaryRestrictions" TEXT,
    "trainerId" TEXT,
    CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientProfile_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClientProfile" ("currentWeight", "dietaryRestrictions", "height", "id", "trainerId", "userId") SELECT "currentWeight", "dietaryRestrictions", "height", "id", "trainerId", "userId" FROM "ClientProfile";
DROP TABLE "ClientProfile";
ALTER TABLE "new_ClientProfile" RENAME TO "ClientProfile";
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
