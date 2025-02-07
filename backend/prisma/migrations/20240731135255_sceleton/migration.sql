/*
  Warnings:

  - You are about to drop the column `storeName` on the `User` table. All the data in the column will be lost.
  - Added the required column `storeUrl` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "storeName",
ADD COLUMN     "storeUrl" TEXT NOT NULL;
