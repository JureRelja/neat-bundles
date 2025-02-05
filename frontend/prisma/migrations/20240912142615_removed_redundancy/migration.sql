/*
  Warnings:

  - You are about to drop the `AddedProductVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddedProductVariant" DROP CONSTRAINT "AddedProductVariant_createdBundleId_fkey";

-- AlterTable
ALTER TABLE "createdBundle" ADD COLUMN     "addedProductVariants" TEXT[];

-- DropTable
DROP TABLE "AddedProductVariant";
