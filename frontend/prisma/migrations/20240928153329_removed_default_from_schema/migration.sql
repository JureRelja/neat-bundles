/*
  Warnings:

  - You are about to drop the column `numOfProductColumns` on the `BundleSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BundleBuilder" ALTER COLUMN "pricing" DROP DEFAULT,
ALTER COLUMN "discountType" DROP DEFAULT,
ALTER COLUMN "discountValue" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BundleColors" ALTER COLUMN "stepsIcon" DROP DEFAULT,
ALTER COLUMN "addToBundleBtn" DROP DEFAULT,
ALTER COLUMN "addToBundleText" DROP DEFAULT,
ALTER COLUMN "nextStepBtn" DROP DEFAULT,
ALTER COLUMN "nextStepBtnText" DROP DEFAULT,
ALTER COLUMN "titleAndDESC" DROP DEFAULT,
ALTER COLUMN "viewProductBtn" DROP DEFAULT,
ALTER COLUMN "removeProductsBtn" DROP DEFAULT,
ALTER COLUMN "prevStepBtn" DROP DEFAULT,
ALTER COLUMN "prevStepBtnText" DROP DEFAULT,
ALTER COLUMN "removeProductsBtnText" DROP DEFAULT,
ALTER COLUMN "viewProductBtnText" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BundleLabels" ALTER COLUMN "addToBundleBtn" DROP DEFAULT,
ALTER COLUMN "nextStepBtn" DROP DEFAULT,
ALTER COLUMN "prevStepBtn" DROP DEFAULT,
ALTER COLUMN "viewProductBtn" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BundleSettings" DROP COLUMN "numOfProductColumns",
ALTER COLUMN "displayDiscountBanner" DROP DEFAULT,
ALTER COLUMN "skipTheCart" DROP DEFAULT,
ALTER COLUMN "allowBackNavigation" DROP DEFAULT,
ALTER COLUMN "showOutOfStockProducts" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BundleStep" ALTER COLUMN "description" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentInput" ALTER COLUMN "inputType" DROP DEFAULT,
ALTER COLUMN "inputLabel" DROP DEFAULT,
ALTER COLUMN "maxChars" DROP DEFAULT,
ALTER COLUMN "required" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductInput" ALTER COLUMN "minProductsOnStep" DROP DEFAULT,
ALTER COLUMN "maxProductsOnStep" DROP DEFAULT,
ALTER COLUMN "allowProductDuplicates" DROP DEFAULT,
ALTER COLUMN "showProductPrice" DROP DEFAULT;
