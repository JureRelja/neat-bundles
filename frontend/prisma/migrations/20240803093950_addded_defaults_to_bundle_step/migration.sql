-- AlterTable
ALTER TABLE "BundleStep" ALTER COLUMN "resourceType" SET DEFAULT 'PRODUCT',
ALTER COLUMN "minProductsOnStep" SET DEFAULT 1,
ALTER COLUMN "maxProductsOnStep" SET DEFAULT 3;
