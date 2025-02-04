/*
  Warnings:

  - You are about to drop the column `bundleColorsId` on the `BundleSettings` table. All the data in the column will be lost.
  - You are about to drop the column `bundleLabelsId` on the `BundleSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bundleSettingsId]` on the table `BundleColors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bundleSettingsId]` on the table `BundleLabels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bundleId]` on the table `BundleSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bundleSettingsId` to the `BundleColors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bundleSettingsId` to the `BundleLabels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bundleId` to the `BundleSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bundle" DROP CONSTRAINT "Bundle_bundleSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "Bundle" DROP CONSTRAINT "Bundle_storeUrl_fkey";

-- DropForeignKey
ALTER TABLE "BundleSettings" DROP CONSTRAINT "BundleSettings_bundleColorsId_fkey";

-- DropForeignKey
ALTER TABLE "BundleSettings" DROP CONSTRAINT "BundleSettings_bundleLabelsId_fkey";

-- DropForeignKey
ALTER TABLE "BundleStep" DROP CONSTRAINT "BundleStep_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "ContentStep" DROP CONSTRAINT "ContentStep_bundleStepId_fkey";

-- DropForeignKey
ALTER TABLE "ProductStep" DROP CONSTRAINT "ProductStep_bundleStepId_fkey";

-- DropIndex
DROP INDEX "BundleSettings_bundleColorsId_key";

-- DropIndex
DROP INDEX "BundleSettings_bundleLabelsId_key";

-- AlterTable
ALTER TABLE "BundleColors" ADD COLUMN     "bundleSettingsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BundleLabels" ADD COLUMN     "bundleSettingsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BundleSettings" DROP COLUMN "bundleColorsId",
DROP COLUMN "bundleLabelsId",
ADD COLUMN     "bundleId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BundleColors_bundleSettingsId_key" ON "BundleColors"("bundleSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleLabels_bundleSettingsId_key" ON "BundleLabels"("bundleSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleSettings_bundleId_key" ON "BundleSettings"("bundleId");

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_storeUrl_fkey" FOREIGN KEY ("storeUrl") REFERENCES "User"("storeUrl") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleStep" ADD CONSTRAINT "BundleStep_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStep" ADD CONSTRAINT "ProductStep_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStep" ADD CONSTRAINT "ContentStep_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleSettings" ADD CONSTRAINT "BundleSettings_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleColors" ADD CONSTRAINT "BundleColors_bundleSettingsId_fkey" FOREIGN KEY ("bundleSettingsId") REFERENCES "BundleSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleLabels" ADD CONSTRAINT "BundleLabels_bundleSettingsId_fkey" FOREIGN KEY ("bundleSettingsId") REFERENCES "BundleSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
