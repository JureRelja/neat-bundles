/*
  Warnings:

  - A unique constraint covering the columns `[bundleStepId]` on the table `ContentStep` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bundleStepId]` on the table `ProductStep` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ContentStep_bundleStepId_key" ON "ContentStep"("bundleStepId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductStep_bundleStepId_key" ON "ProductStep"("bundleStepId");
