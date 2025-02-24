/*
  Warnings:

  - Added the required column `bundlePageUrl` to the `BundleBuilder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BundleBuilder" ADD COLUMN     "bundlePageUrl" TEXT NOT NULL;
