/*
  Warnings:

  - Added the required column `accountOwner` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "accountOwner",
ADD COLUMN     "accountOwner" BOOLEAN NOT NULL;
