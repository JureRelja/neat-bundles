-- AlterTable
ALTER TABLE "BundleColors" ALTER COLUMN "stepsIcon" SET DEFAULT '#000000',
ALTER COLUMN "addToBundleBtn" SET DEFAULT '#000000',
ALTER COLUMN "addToBundleText" SET DEFAULT '#000000',
ALTER COLUMN "nextStepBtn" SET DEFAULT '#000000',
ALTER COLUMN "nextStepBtnText" SET DEFAULT '#000000',
ALTER COLUMN "titleAndDESC" SET DEFAULT '#000000',
ALTER COLUMN "viewProductBtn" SET DEFAULT '#000000',
ALTER COLUMN "removeProductsBtn" SET DEFAULT '#000000',
ALTER COLUMN "prevStepBtn" SET DEFAULT '#000000',
ALTER COLUMN "prevStepBtnText" SET DEFAULT '#000000';

-- AlterTable
ALTER TABLE "BundleLabels" ALTER COLUMN "addToBundleBtn" SET DEFAULT 'Add to bundle',
ALTER COLUMN "nextStepBtn" SET DEFAULT 'Next step',
ALTER COLUMN "prevStepBtn" SET DEFAULT 'Previous step',
ALTER COLUMN "viewProductBtn" SET DEFAULT 'View product';

-- AlterTable
ALTER TABLE "BundleSettings" ALTER COLUMN "pricing" SET DEFAULT 'FIXED',
ALTER COLUMN "discountType" SET DEFAULT 'NO_DISCOUNT',
ALTER COLUMN "discountValue" SET DEFAULT 0,
ALTER COLUMN "displayDiscountBanner" SET DEFAULT false,
ALTER COLUMN "skipTheCart" SET DEFAULT false,
ALTER COLUMN "allowBackNavigation" SET DEFAULT true,
ALTER COLUMN "showOutOfStockProducts" SET DEFAULT false,
ALTER COLUMN "numOfProductColumns" SET DEFAULT 3;
