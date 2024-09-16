/*
  Warnings:

  - You are about to drop the column `discountAmounts` on the `createdBundle` table. All the data in the column will be lost.
  - Added the required column `discountAmount` to the `createdBundle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "createdBundle" DROP COLUMN "discountAmounts",
ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL;
