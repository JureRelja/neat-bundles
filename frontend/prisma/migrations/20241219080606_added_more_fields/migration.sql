/*
  Warnings:

  - Added the required column `collaborator` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailVerified` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "accountOwner" TEXT,
ADD COLUMN     "collaborator" BOOLEAN NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "locale" TEXT;
