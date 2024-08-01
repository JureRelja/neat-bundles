/*
  Warnings:

  - You are about to drop the column `userId` on the `Bundle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeUrl]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeUrl` to the `Bundle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bundle" DROP CONSTRAINT "Bundle_userId_fkey";

-- AlterTable
ALTER TABLE "Bundle" DROP COLUMN "userId",
ADD COLUMN     "storeUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "ownerName" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "User_storeUrl_key" ON "User"("storeUrl");

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_storeUrl_fkey" FOREIGN KEY ("storeUrl") REFERENCES "User"("storeUrl") ON DELETE RESTRICT ON UPDATE CASCADE;
