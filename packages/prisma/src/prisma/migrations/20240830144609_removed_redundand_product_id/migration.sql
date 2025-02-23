/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToProductInput" DROP CONSTRAINT "_ProductToProductInput_A_fkey";

-- DropIndex
DROP INDEX "Product_shopifyProductId_key";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("shopifyProductId");

-- AlterTable
ALTER TABLE "_ProductToProductInput" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_ProductToProductInput" ADD CONSTRAINT "_ProductToProductInput_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("shopifyProductId") ON DELETE CASCADE ON UPDATE CASCADE;
