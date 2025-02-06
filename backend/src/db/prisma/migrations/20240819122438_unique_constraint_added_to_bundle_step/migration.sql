/*
  Warnings:

  - A unique constraint covering the columns `[bundleId,stepNumber]` on the table `BundleStep` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BundleStep_bundleId_stepNumber_key" ON "BundleStep"("bundleId", "stepNumber");
