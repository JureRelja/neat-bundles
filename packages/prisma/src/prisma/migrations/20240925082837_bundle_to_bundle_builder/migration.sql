/*
  Warnings:

  - You are about to drop the column `bundleId` on the `BundleSettings` table. All the data in the column will be lost.
  - You are about to drop the column `bundleId` on the `BundleStep` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bundleBuilderId]` on the table `BundleSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bundleBuilderId` to the `BundleSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bundleBuilderId` to the `BundleStep` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BundleSettings" DROP CONSTRAINT "BundleSettings_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "BundleStep" DROP CONSTRAINT "BundleStep_bundleId_fkey";

-- DropIndex
DROP INDEX "BundleSettings_bundleId_key";

-- AlterTable
ALTER TABLE "BundleSettings" DROP COLUMN "bundleId",
ADD COLUMN     "bundleBuilderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BundleStep" DROP COLUMN "bundleId",
ADD COLUMN     "bundleBuilderId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BundleSettings_bundleBuilderId_key" ON "BundleSettings"("bundleBuilderId");

-- AddForeignKey
ALTER TABLE "BundleStep" ADD CONSTRAINT "BundleStep_bundleBuilderId_fkey" FOREIGN KEY ("bundleBuilderId") REFERENCES "BundleBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleSettings" ADD CONSTRAINT "BundleSettings_bundleBuilderId_fkey" FOREIGN KEY ("bundleBuilderId") REFERENCES "BundleBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
