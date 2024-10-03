/*
  Warnings:

  - You are about to drop the column `bundlePageUrl` on the `BundleBuilder` table. All the data in the column will be lost.
  - Added the required column `bundleBuilderPageHandler` to the `BundleBuilder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BundleBuilder" DROP COLUMN "bundlePageUrl",
ADD COLUMN     "bundleBuilderPageHandler" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CreatedBundle" ADD COLUMN     "isVariantSold" BOOLEAN NOT NULL DEFAULT false;
