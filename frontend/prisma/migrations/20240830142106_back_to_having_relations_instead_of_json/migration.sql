/*
  Warnings:

  - You are about to drop the column `products` on the `ProductInput` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductInput" DROP COLUMN "products";

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "productInputId" INTEGER NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "shopifyProductHandle" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopifyProductId_key" ON "Product"("shopifyProductId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productInputId_fkey" FOREIGN KEY ("productInputId") REFERENCES "ProductInput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
