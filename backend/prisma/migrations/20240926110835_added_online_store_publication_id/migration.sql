/*
  Warnings:

  - Added the required column `onlineStorePublicationId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onlineStorePublicationId" TEXT NOT NULL;
