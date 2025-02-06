/*
  Warnings:

  - You are about to drop the column `bundleBuilderPageHandler` on the `BundleBuilder` table. All the data in the column will be lost.
  - Added the required column `bundleBuilderPageHandle` to the `BundleBuilder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BundleBuilder" DROP COLUMN "bundleBuilderPageHandler",
ADD COLUMN     "bundleBuilderPageHandle" TEXT NOT NULL;
