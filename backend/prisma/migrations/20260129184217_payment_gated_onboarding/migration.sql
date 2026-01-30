-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "accountStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionExpiresAt" DATETIME,
    "paymentQrCode" TEXT,
    "loginToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "isActive", "loginToken", "name", "password", "paymentQrCode", "role", "subscriptionExpiresAt", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "loginToken", "name", "password", "paymentQrCode", "role", "subscriptionExpiresAt", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "receiverId" TEXT,
    "paymentType" TEXT NOT NULL DEFAULT 'SUBSCRIPTION',
    "amount" REAL NOT NULL,
    "screenshotUrl" TEXT,
    "transactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "id", "screenshotUrl", "status", "transactionId", "updatedAt", "userId") SELECT "amount", "createdAt", "id", "screenshotUrl", "status", "transactionId", "updatedAt", "userId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE TABLE "new_ClientProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activationStatus" TEXT NOT NULL DEFAULT 'REGISTERED',
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
INSERT INTO "new_ClientProfile" ("age", "currentDiet", "currentWeight", "currentWorkout", "dietType", "dietaryRestrictions", "foodAllergies", "height", "id", "injuries", "isQuestionnaireFilled", "lactoseIntolerant", "strongParts", "trainerId", "userId", "weakParts", "workoutTime") SELECT "age", "currentDiet", "currentWeight", "currentWorkout", "dietType", "dietaryRestrictions", "foodAllergies", "height", "id", "injuries", "isQuestionnaireFilled", "lactoseIntolerant", "strongParts", "trainerId", "userId", "weakParts", "workoutTime" FROM "ClientProfile";
DROP TABLE "ClientProfile";
ALTER TABLE "new_ClientProfile" RENAME TO "ClientProfile";
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
