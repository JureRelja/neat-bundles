/*
  Warnings:

  - You are about to drop the column `storeUrl` on the `BundleBuilder` table. All the data in the column will be lost.
  - You are about to drop the column `isVariantSold` on the `CreatedBundle` table. All the data in the column will be lost.
  - You are about to drop the column `storeUrl` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `storeUrl` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shop]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shop` to the `BundleBuilder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `CreatedBundle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `Settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BundleBuilder" DROP CONSTRAINT "BundleBuilder_storeUrl_fkey";

-- DropForeignKey
ALTER TABLE "CreatedBundle" DROP CONSTRAINT "CreatedBundle_bundleBuilderId_fkey";

-- DropForeignKey
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_storeUrl_fkey";

-- DropIndex
DROP INDEX "Settings_storeUrl_key";

-- DropIndex
DROP INDEX "User_storeUrl_key";

-- AlterTable
ALTER TABLE "BundleBuilder" DROP COLUMN "storeUrl",
ADD COLUMN     "shop" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CreatedBundle" DROP COLUMN "isVariantSold",
ADD COLUMN     "isSold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shop" TEXT NOT NULL,
ALTER COLUMN "bundleBuilderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "storeUrl",
ADD COLUMN     "shop" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "storeUrl",
ADD COLUMN     "shop" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Settings_shop_key" ON "Settings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "User_shop_key" ON "User"("shop");

-- AddForeignKey
ALTER TABLE "BundleBuilder" ADD CONSTRAINT "BundleBuilder_shop_fkey" FOREIGN KEY ("shop") REFERENCES "User"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatedBundle" ADD CONSTRAINT "CreatedBundle_shop_fkey" FOREIGN KEY ("shop") REFERENCES "User"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_shop_fkey" FOREIGN KEY ("shop") REFERENCES "User"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
