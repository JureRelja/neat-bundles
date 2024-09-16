/*
  Warnings:

  - You are about to drop the column `shopifyId` on the `Bundle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopifyProductId]` on the table `Bundle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyPageId]` on the table `Bundle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopifyPageId` to the `Bundle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopifyProductId` to the `Bundle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Bundle_shopifyId_key";

-- AlterTable
ALTER TABLE "Bundle" DROP COLUMN "shopifyId",
ADD COLUMN     "shopifyPageId" TEXT NOT NULL,
ADD COLUMN     "shopifyProductId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_shopifyProductId_key" ON "Bundle"("shopifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_shopifyPageId_key" ON "Bundle"("shopifyPageId");
