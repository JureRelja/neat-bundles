/*
  Warnings:

  - You are about to drop the column `globalSettingsId` on the `BundleColors` table. All the data in the column will be lost.
  - You are about to drop the column `onlineStorePublicationId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[settingsId]` on the table `BundleColors` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `settingsId` to the `BundleColors` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BundleColors" DROP CONSTRAINT "BundleColors_globalSettingsId_fkey";

-- DropIndex
DROP INDEX "BundleColors_globalSettingsId_key";

-- AlterTable
ALTER TABLE "BundleColors" DROP COLUMN "globalSettingsId",
ADD COLUMN     "settingsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "onlineStorePublicationId";

-- CreateIndex
CREATE UNIQUE INDEX "BundleColors_settingsId_key" ON "BundleColors"("settingsId");

-- AddForeignKey
ALTER TABLE "BundleColors" ADD CONSTRAINT "BundleColors_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
