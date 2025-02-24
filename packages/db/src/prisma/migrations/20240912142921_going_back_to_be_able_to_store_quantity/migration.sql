/*
  Warnings:

  - You are about to drop the column `addedProductVariants` on the `createdBundle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "createdBundle" DROP COLUMN "addedProductVariants";

-- CreateTable
CREATE TABLE "AddedProductVariant" (
    "id" SERIAL NOT NULL,
    "productVariant" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdBundleId" INTEGER NOT NULL,

    CONSTRAINT "AddedProductVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AddedProductVariant" ADD CONSTRAINT "AddedProductVariant_createdBundleId_fkey" FOREIGN KEY ("createdBundleId") REFERENCES "createdBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
