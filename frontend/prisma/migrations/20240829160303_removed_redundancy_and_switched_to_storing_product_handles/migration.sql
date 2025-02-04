/*
  Warnings:

  - You are about to drop the column `productResources` on the `ProductsData` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `ProductsData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductsData" DROP COLUMN "productResources",
DROP COLUMN "resourceType",
ADD COLUMN     "productHandles" TEXT[];

-- DropEnum
DROP TYPE "ProductResourceType";
