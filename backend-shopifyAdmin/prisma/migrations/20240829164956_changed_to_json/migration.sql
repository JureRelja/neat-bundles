/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productInputId_fkey";

-- AlterTable
ALTER TABLE "ProductInput" ADD COLUMN     "products" JSONB;

-- DropTable
DROP TABLE "Product";
