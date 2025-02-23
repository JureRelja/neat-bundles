/*
  Warnings:

  - You are about to drop the column `bundleSettingsId` on the `Bundle` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Bundle_bundleSettingsId_key";

-- AlterTable
ALTER TABLE "Bundle" DROP COLUMN "bundleSettingsId";
