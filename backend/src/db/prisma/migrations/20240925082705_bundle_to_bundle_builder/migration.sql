/*
  Warnings:

  - You are about to drop the `Bundle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `createdBundle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddedContent" DROP CONSTRAINT "AddedContent_createdBundleId_fkey";

-- DropForeignKey
ALTER TABLE "AddedProductVariant" DROP CONSTRAINT "AddedProductVariant_createdBundleId_fkey";

-- DropForeignKey
ALTER TABLE "Bundle" DROP CONSTRAINT "Bundle_storeUrl_fkey";

-- DropForeignKey
ALTER TABLE "BundleSettings" DROP CONSTRAINT "BundleSettings_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "BundleStep" DROP CONSTRAINT "BundleStep_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "createdBundle" DROP CONSTRAINT "createdBundle_bundleId_fkey";

-- DropTable
DROP TABLE "Bundle";

-- DropTable
DROP TABLE "createdBundle";

-- CreateTable
CREATE TABLE "BundleBuilder" (
    "id" SERIAL NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "shopifyProductId" TEXT NOT NULL,
    "shopifyPageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pricing" "BundlePricing" NOT NULL DEFAULT 'CALCULATED',
    "priceAmount" DOUBLE PRECISION,
    "discountType" "BundleDiscountType" NOT NULL DEFAULT 'NO_DISCOUNT',
    "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storeUrl" TEXT NOT NULL,

    CONSTRAINT "BundleBuilder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatedBundle" (
    "id" SERIAL NOT NULL,
    "bundleBuilderId" INTEGER NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatedBundle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BundleBuilder_shopifyProductId_key" ON "BundleBuilder"("shopifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleBuilder_shopifyPageId_key" ON "BundleBuilder"("shopifyPageId");

-- AddForeignKey
ALTER TABLE "BundleBuilder" ADD CONSTRAINT "BundleBuilder_storeUrl_fkey" FOREIGN KEY ("storeUrl") REFERENCES "User"("storeUrl") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleStep" ADD CONSTRAINT "BundleStep_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "BundleBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleSettings" ADD CONSTRAINT "BundleSettings_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "BundleBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatedBundle" ADD CONSTRAINT "CreatedBundle_bundleBuilderId_fkey" FOREIGN KEY ("bundleBuilderId") REFERENCES "BundleBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddedProductVariant" ADD CONSTRAINT "AddedProductVariant_createdBundleId_fkey" FOREIGN KEY ("createdBundleId") REFERENCES "CreatedBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddedContent" ADD CONSTRAINT "AddedContent_createdBundleId_fkey" FOREIGN KEY ("createdBundleId") REFERENCES "CreatedBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
