-- CreateTable
CREATE TABLE "createdBundle" (
    "id" SERIAL NOT NULL,
    "bundleId" INTEGER NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "discountAmounts" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "createdBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddedProductVariant" (
    "id" SERIAL NOT NULL,
    "productVariant" TEXT NOT NULL,
    "createdBundleId" INTEGER NOT NULL,

    CONSTRAINT "AddedProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddedContent" (
    "id" SERIAL NOT NULL,
    "contentType" "InputType" NOT NULL,
    "contentValue" TEXT NOT NULL,
    "createdBundleId" INTEGER NOT NULL,

    CONSTRAINT "AddedContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "createdBundle" ADD CONSTRAINT "createdBundle_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddedProductVariant" ADD CONSTRAINT "AddedProductVariant_createdBundleId_fkey" FOREIGN KEY ("createdBundleId") REFERENCES "createdBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddedContent" ADD CONSTRAINT "AddedContent_createdBundleId_fkey" FOREIGN KEY ("createdBundleId") REFERENCES "createdBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
