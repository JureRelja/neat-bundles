/*
  Warnings:

  - You are about to drop the column `bundleBuilderPageHandle` on the `BundleBuilder` table. All the data in the column will be lost.
  - You are about to drop the column `shopifyPageId` on the `BundleBuilder` table. All the data in the column will be lost.
  - You are about to drop the column `globalSettingsId` on the `BundleLabels` table. All the data in the column will be lost.
  - You are about to drop the `BundleSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BundleStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GlobalSettings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[settingsId]` on the table `BundleLabels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `settingsId` to the `BundleLabels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BundleColors" DROP CONSTRAINT "BundleColors_globalSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "BundleLabels" DROP CONSTRAINT "BundleLabels_globalSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "BundleSettings" DROP CONSTRAINT "BundleSettings_bundleBuilderId_fkey";

-- DropForeignKey
ALTER TABLE "BundleStep" DROP CONSTRAINT "BundleStep_bundleBuilderId_fkey";

-- DropForeignKey
ALTER TABLE "ContentInput" DROP CONSTRAINT "ContentInput_bundleStepId_fkey";

-- DropForeignKey
ALTER TABLE "GlobalSettings" DROP CONSTRAINT "GlobalSettings_storeUrl_fkey";

-- DropForeignKey
ALTER TABLE "ProductInput" DROP CONSTRAINT "ProductInput_bundleStepId_fkey";

-- DropIndex
DROP INDEX "BundleBuilder_shopifyPageId_key";

-- DropIndex
DROP INDEX "BundleLabels_globalSettingsId_key";

-- AlterTable
ALTER TABLE "BundleBuilder" DROP COLUMN "bundleBuilderPageHandle",
DROP COLUMN "shopifyPageId",
ALTER COLUMN "pricing" SET DEFAULT 'CALCULATED',
ALTER COLUMN "discountType" SET DEFAULT 'NO_DISCOUNT',
ALTER COLUMN "discountValue" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BundleLabels" DROP COLUMN "globalSettingsId",
ADD COLUMN     "settingsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "_ProductToProductInput" ADD CONSTRAINT "_ProductToProductInput_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductToProductInput_AB_unique";

-- DropTable
DROP TABLE "BundleSettings";

-- DropTable
DROP TABLE "BundleStep";

-- DropTable
DROP TABLE "GlobalSettings";

-- CreateTable
CREATE TABLE "BundleBuilderConfig" (
    "id" SERIAL NOT NULL,
    "skipTheCart" BOOLEAN NOT NULL,
    "allowBackNavigation" BOOLEAN NOT NULL,
    "showOutOfStockProducts" BOOLEAN NOT NULL,
    "bundleBuilderId" INTEGER NOT NULL,

    CONSTRAINT "BundleBuilderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleBuilderStep" (
    "id" SERIAL NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "stepType" "StepType" NOT NULL,
    "description" TEXT NOT NULL,
    "bundleBuilderId" INTEGER NOT NULL,

    CONSTRAINT "BundleBuilderStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "storeUrl" TEXT NOT NULL,
    "stepNavigationTypeDesktop" "StepNavigationType" NOT NULL DEFAULT 'NORMAL',
    "stepNavigationTypeMobile" "StepNavigationType" NOT NULL DEFAULT 'STICKY',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BundleBuilderConfig_bundleBuilderId_key" ON "BundleBuilderConfig"("bundleBuilderId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_storeUrl_key" ON "Settings"("storeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "BundleLabels_settingsId_key" ON "BundleLabels"("settingsId");

-- AddForeignKey
ALTER TABLE "BundleColors" ADD CONSTRAINT "BundleColors_globalSettingsId_fkey" FOREIGN KEY ("globalSettingsId") REFERENCES "Settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleLabels" ADD CONSTRAINT "BundleLabels_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleBuilderConfig" ADD CONSTRAINT "BundleBuilderConfig_bundleBuilderId_fkey" FOREIGN KEY ("bundleBuilderId") REFERENCES "BundleBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleBuilderStep" ADD CONSTRAINT "BundleBuilderStep_bundleBuilderId_fkey" FOREIGN KEY ("bundleBuilderId") REFERENCES "BundleBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentInput" ADD CONSTRAINT "ContentInput_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleBuilderStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_storeUrl_fkey" FOREIGN KEY ("storeUrl") REFERENCES "User"("storeUrl") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInput" ADD CONSTRAINT "ProductInput_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleBuilderStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
