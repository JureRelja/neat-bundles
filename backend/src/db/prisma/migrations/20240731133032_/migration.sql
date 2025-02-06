-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('PRODUCT', 'CONTENT');

-- CreateEnum
CREATE TYPE "ProductResourceType" AS ENUM ('PRODUCT', 'COLLECTION');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('TEXT', 'IMAGE', 'NUMBER');

-- CreateEnum
CREATE TYPE "BundlePricing" AS ENUM ('FIXED', 'CALCULATED');

-- CreateEnum
CREATE TYPE "BundleDiscountType" AS ENUM ('FIXED', 'PERCENTAGE', 'NO_DISCOUNT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "ownerName" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "settingsId" INTEGER NOT NULL,
    "bundleSettingsId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" SERIAL NOT NULL,
    "bundleId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "stepType" "StepType" NOT NULL,
    "description" TEXT NOT NULL,
    "productResources" TEXT[],
    "resourceType" "ProductResourceType" NOT NULL,
    "minProductsOnStep" INTEGER NOT NULL,
    "maxProductsOnStep" INTEGER NOT NULL,
    "allowProductDuplicates" BOOLEAN NOT NULL,
    "showProductPrice" BOOLEAN NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentInput" (
    "id" SERIAL NOT NULL,
    "stepId" INTEGER NOT NULL,
    "inputType" "InputType" NOT NULL,
    "inputLabel" TEXT NOT NULL,
    "maxChars" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL,
    "inputValue" TEXT NOT NULL,

    CONSTRAINT "ContentInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleSettings" (
    "id" SERIAL NOT NULL,
    "pricing" "BundlePricing" NOT NULL,
    "discountType" "BundleDiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "displayDiscountBanner" BOOLEAN NOT NULL,
    "skipTheCart" BOOLEAN NOT NULL,
    "allowBackNavigation" BOOLEAN NOT NULL,
    "showOutOfStockProducts" BOOLEAN NOT NULL,
    "numOfProductColumns" INTEGER NOT NULL,
    "bundleColorsId" INTEGER NOT NULL,
    "bundleLabelsId" INTEGER NOT NULL,

    CONSTRAINT "BundleSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleColors" (
    "id" SERIAL NOT NULL,
    "stepsIcon" TEXT NOT NULL,
    "addToBundleBtn" TEXT NOT NULL,
    "addToBundleText" TEXT NOT NULL,
    "nextStepBtn" TEXT NOT NULL,
    "nextStepBtnText" TEXT NOT NULL,
    "titleAndDESC" TEXT NOT NULL,
    "viewProductBtn" TEXT NOT NULL,
    "removeProductsBtn" TEXT NOT NULL,
    "prevStepBtn" TEXT NOT NULL,
    "prevStepBtnText" TEXT NOT NULL,

    CONSTRAINT "BundleColors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleLabels" (
    "id" SERIAL NOT NULL,
    "addToBundleBtn" TEXT NOT NULL,
    "nextStepBtn" TEXT NOT NULL,
    "prevStepBtn" TEXT NOT NULL,
    "viewProductBtn" TEXT NOT NULL,

    CONSTRAINT "BundleLabels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_bundleSettingsId_key" ON "Bundle"("bundleSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentInput_stepId_key" ON "ContentInput"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleSettings_bundleColorsId_key" ON "BundleSettings"("bundleColorsId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleSettings_bundleLabelsId_key" ON "BundleSettings"("bundleLabelsId");

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_bundleSettingsId_fkey" FOREIGN KEY ("bundleSettingsId") REFERENCES "BundleSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentInput" ADD CONSTRAINT "ContentInput_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleSettings" ADD CONSTRAINT "BundleSettings_bundleColorsId_fkey" FOREIGN KEY ("bundleColorsId") REFERENCES "BundleColors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleSettings" ADD CONSTRAINT "BundleSettings_bundleLabelsId_fkey" FOREIGN KEY ("bundleLabelsId") REFERENCES "BundleLabels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
