/*
  Warnings:

  - You are about to drop the `ProductsData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductsData" DROP CONSTRAINT "ProductsData_bundleStepId_fkey";

-- DropTable
DROP TABLE "ProductsData";

-- CreateTable
CREATE TABLE "ProductInput" (
    "id" SERIAL NOT NULL,
    "bundleStepId" INTEGER NOT NULL,
    "minProductsOnStep" INTEGER NOT NULL DEFAULT 1,
    "maxProductsOnStep" INTEGER NOT NULL DEFAULT 3,
    "allowProductDuplicates" BOOLEAN NOT NULL DEFAULT false,
    "showProductPrice" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "productsDataId" INTEGER NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductInput_bundleStepId_key" ON "ProductInput"("bundleStepId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopifyId_key" ON "Product"("shopifyId");

-- AddForeignKey
ALTER TABLE "ProductInput" ADD CONSTRAINT "ProductInput_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productsDataId_fkey" FOREIGN KEY ("productsDataId") REFERENCES "ProductInput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
