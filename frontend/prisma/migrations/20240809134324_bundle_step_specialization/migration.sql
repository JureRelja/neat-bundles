/*
  Warnings:

  - You are about to drop the column `allowProductDuplicates` on the `BundleStep` table. All the data in the column will be lost.
  - You are about to drop the column `maxProductsOnStep` on the `BundleStep` table. All the data in the column will be lost.
  - You are about to drop the column `minProductsOnStep` on the `BundleStep` table. All the data in the column will be lost.
  - You are about to drop the column `productResources` on the `BundleStep` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `BundleStep` table. All the data in the column will be lost.
  - You are about to drop the column `showProductPrice` on the `BundleStep` table. All the data in the column will be lost.
  - You are about to drop the `ContentInput` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentInput" DROP CONSTRAINT "ContentInput_stepId_fkey";

-- AlterTable
ALTER TABLE "BundleStep" DROP COLUMN "allowProductDuplicates",
DROP COLUMN "maxProductsOnStep",
DROP COLUMN "minProductsOnStep",
DROP COLUMN "productResources",
DROP COLUMN "resourceType",
DROP COLUMN "showProductPrice";

-- DropTable
DROP TABLE "ContentInput";

-- CreateTable
CREATE TABLE "ProductStep" (
    "id" SERIAL NOT NULL,
    "bundleStepId" INTEGER NOT NULL,
    "productResources" TEXT[],
    "resourceType" "ProductResourceType" NOT NULL DEFAULT 'PRODUCT',
    "minProductsOnStep" INTEGER NOT NULL DEFAULT 1,
    "maxProductsOnStep" INTEGER NOT NULL DEFAULT 3,
    "allowProductDuplicates" BOOLEAN NOT NULL DEFAULT false,
    "showProductPrice" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStep" (
    "id" SERIAL NOT NULL,
    "bundleStepId" INTEGER NOT NULL,
    "inputType" "InputType" NOT NULL DEFAULT 'TEXT',
    "inputLabel" TEXT NOT NULL DEFAULT 'Input label',
    "maxChars" INTEGER NOT NULL DEFAULT 100,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContentStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductStep" ADD CONSTRAINT "ProductStep_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStep" ADD CONSTRAINT "ContentStep_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
