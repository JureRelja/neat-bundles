/*
  Warnings:

  - Changed the type of `shopifyPageId` on the `Bundle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Bundle" DROP COLUMN "shopifyPageId",
ADD COLUMN     "shopifyPageId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_shopifyPageId_key" ON "Bundle"("shopifyPageId");
