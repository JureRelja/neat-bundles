/*
  Warnings:

  - The primary key for the `_ProductToProductInput` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_ProductToProductInput` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_ProductToProductInput" DROP CONSTRAINT "_ProductToProductInput_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductInput_AB_unique" ON "_ProductToProductInput"("A", "B");
