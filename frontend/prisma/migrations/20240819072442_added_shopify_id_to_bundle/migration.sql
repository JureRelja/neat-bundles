/*
  Warnings:

  - A unique constraint covering the columns `[shopifyId]` on the table `Bundle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopifyId` to the `Bundle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN     "shopifyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_shopifyId_key" ON "Bundle"("shopifyId");
