-- AlterTable
ALTER TABLE "Bundle" ALTER COLUMN "pricing" SET DEFAULT 'CALCULATED';

-- AlterTable
ALTER TABLE "BundleSettings" ALTER COLUMN "displayDiscountBanner" SET DEFAULT true,
ALTER COLUMN "skipTheCart" SET DEFAULT true;
