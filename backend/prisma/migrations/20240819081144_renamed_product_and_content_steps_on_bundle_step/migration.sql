/*
  Warnings:

  - You are about to drop the `ContentStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductStep` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentStep" DROP CONSTRAINT "ContentStep_bundleStepId_fkey";

-- DropForeignKey
ALTER TABLE "ProductStep" DROP CONSTRAINT "ProductStep_bundleStepId_fkey";

-- DropTable
DROP TABLE "ContentStep";

-- DropTable
DROP TABLE "ProductStep";

-- CreateTable
CREATE TABLE "ProductsData" (
    "id" SERIAL NOT NULL,
    "bundleStepId" INTEGER NOT NULL,
    "productResources" TEXT[],
    "resourceType" "ProductResourceType" NOT NULL DEFAULT 'PRODUCT',
    "minProductsOnStep" INTEGER NOT NULL DEFAULT 1,
    "maxProductsOnStep" INTEGER NOT NULL DEFAULT 3,
    "allowProductDuplicates" BOOLEAN NOT NULL DEFAULT false,
    "showProductPrice" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductsData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentInputs" (
    "id" SERIAL NOT NULL,
    "bundleStepId" INTEGER NOT NULL,
    "inputType" "InputType" NOT NULL DEFAULT 'TEXT',
    "inputLabel" TEXT NOT NULL DEFAULT 'Input label',
    "maxChars" INTEGER NOT NULL DEFAULT 100,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContentInputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductsData_bundleStepId_key" ON "ProductsData"("bundleStepId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentInputs_bundleStepId_key" ON "ContentInputs"("bundleStepId");

-- AddForeignKey
ALTER TABLE "ProductsData" ADD CONSTRAINT "ProductsData_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentInputs" ADD CONSTRAINT "ContentInputs_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
