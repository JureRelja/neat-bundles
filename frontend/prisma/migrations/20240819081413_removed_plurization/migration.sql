/*
  Warnings:

  - You are about to drop the `ContentInputs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentInputs" DROP CONSTRAINT "ContentInputs_bundleStepId_fkey";

-- DropTable
DROP TABLE "ContentInputs";

-- CreateTable
CREATE TABLE "ContentInput" (
    "id" SERIAL NOT NULL,
    "bundleStepId" INTEGER NOT NULL,
    "inputType" "InputType" NOT NULL DEFAULT 'TEXT',
    "inputLabel" TEXT NOT NULL DEFAULT 'Input label',
    "maxChars" INTEGER NOT NULL DEFAULT 100,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContentInput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentInput_bundleStepId_key" ON "ContentInput"("bundleStepId");

-- AddForeignKey
ALTER TABLE "ContentInput" ADD CONSTRAINT "ContentInput_bundleStepId_fkey" FOREIGN KEY ("bundleStepId") REFERENCES "BundleStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
