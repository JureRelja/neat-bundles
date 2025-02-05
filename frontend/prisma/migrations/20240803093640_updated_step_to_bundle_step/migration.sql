/*
  Warnings:

  - You are about to drop the `Step` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentInput" DROP CONSTRAINT "ContentInput_stepId_fkey";

-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_bundleId_fkey";

-- DropTable
DROP TABLE "Step";

-- CreateTable
CREATE TABLE "BundleStep" (
    "id" SERIAL NOT NULL,
    "bundleId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "stepType" "StepType" NOT NULL DEFAULT 'PRODUCT',
    "description" TEXT NOT NULL DEFAULT 'Description for this step',
    "productResources" TEXT[],
    "resourceType" "ProductResourceType" NOT NULL,
    "minProductsOnStep" INTEGER NOT NULL,
    "maxProductsOnStep" INTEGER NOT NULL,
    "allowProductDuplicates" BOOLEAN NOT NULL DEFAULT false,
    "showProductPrice" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BundleStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BundleStep" ADD CONSTRAINT "BundleStep_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentInput" ADD CONSTRAINT "ContentInput_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "BundleStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
