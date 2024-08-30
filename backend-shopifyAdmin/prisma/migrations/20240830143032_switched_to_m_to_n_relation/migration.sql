/*
  Warnings:

  - You are about to drop the column `productInputId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productInputId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productInputId";

-- CreateTable
CREATE TABLE "_ProductToProductInput" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductInput_AB_unique" ON "_ProductToProductInput"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductInput_B_index" ON "_ProductToProductInput"("B");

-- AddForeignKey
ALTER TABLE "_ProductToProductInput" ADD CONSTRAINT "_ProductToProductInput_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductInput" ADD CONSTRAINT "_ProductToProductInput_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductInput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
