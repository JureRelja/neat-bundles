/*
  Warnings:

  - You are about to drop the column `displayDiscountBanner` on the `BundleSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BundleSettings" DROP COLUMN "displayDiscountBanner",
ADD COLUMN     "hidePricingSummary" BOOLEAN NOT NULL DEFAULT false;
