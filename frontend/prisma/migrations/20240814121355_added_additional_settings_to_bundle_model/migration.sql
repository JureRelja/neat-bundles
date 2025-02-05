/*
  Warnings:

  - You are about to drop the column `discountType` on the `BundleSettings` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `BundleSettings` table. All the data in the column will be lost.
  - You are about to drop the column `pricing` on the `BundleSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN     "discountType" "BundleDiscountType" NOT NULL DEFAULT 'NO_DISCOUNT',
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "priceAmount" DOUBLE PRECISION,
ADD COLUMN     "pricing" "BundlePricing" NOT NULL DEFAULT 'FIXED';

-- AlterTable
ALTER TABLE "BundleSettings" DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "pricing";
