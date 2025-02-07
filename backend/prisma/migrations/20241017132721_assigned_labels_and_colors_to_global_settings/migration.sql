/*
  Warnings:

  - You are about to drop the column `bundleSettingsId` on the `BundleColors` table. All the data in the column will be lost.
  - You are about to drop the column `bundleSettingsId` on the `BundleLabels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[globalSettingsId]` on the table `BundleColors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[globalSettingsId]` on the table `BundleLabels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `globalSettingsId` to the `BundleColors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalSettingsId` to the `BundleLabels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BundleColors" DROP CONSTRAINT "BundleColors_bundleSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "BundleLabels" DROP CONSTRAINT "BundleLabels_bundleSettingsId_fkey";

-- DropIndex
DROP INDEX "BundleColors_bundleSettingsId_key";

-- DropIndex
DROP INDEX "BundleLabels_bundleSettingsId_key";

-- AlterTable
ALTER TABLE "BundleColors" DROP COLUMN "bundleSettingsId",
ADD COLUMN     "globalSettingsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BundleLabels" DROP COLUMN "bundleSettingsId",
ADD COLUMN     "globalSettingsId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BundleColors_globalSettingsId_key" ON "BundleColors"("globalSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleLabels_globalSettingsId_key" ON "BundleLabels"("globalSettingsId");

-- AddForeignKey
ALTER TABLE "BundleColors" ADD CONSTRAINT "BundleColors_globalSettingsId_fkey" FOREIGN KEY ("globalSettingsId") REFERENCES "GlobalSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleLabels" ADD CONSTRAINT "BundleLabels_globalSettingsId_fkey" FOREIGN KEY ("globalSettingsId") REFERENCES "GlobalSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
