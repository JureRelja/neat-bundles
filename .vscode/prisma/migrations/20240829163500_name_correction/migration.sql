/*
  Warnings:

  - You are about to drop the column `productsDataId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `productInputId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productsDataId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productsDataId",
ADD COLUMN     "productInputId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productInputId_fkey" FOREIGN KEY ("productInputId") REFERENCES "ProductInput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
