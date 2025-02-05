/*
  Warnings:

  - A unique constraint covering the columns `[storeUrl]` on the table `GlobalSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeUrl` to the `GlobalSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GlobalSettings" ADD COLUMN     "storeUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSettings_storeUrl_key" ON "GlobalSettings"("storeUrl");

-- AddForeignKey
ALTER TABLE "GlobalSettings" ADD CONSTRAINT "GlobalSettings_storeUrl_fkey" FOREIGN KEY ("storeUrl") REFERENCES "User"("storeUrl") ON DELETE CASCADE ON UPDATE CASCADE;
