/*
  Warnings:

  - You are about to drop the column `displayMobileStepNavigation` on the `GlobalSettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StepNavigationType" AS ENUM ('STICKY', 'NORMAL');

-- AlterTable
ALTER TABLE "GlobalSettings" DROP COLUMN "displayMobileStepNavigation",
ADD COLUMN     "stepNavigationTypeDesktop" "StepNavigationType" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "stepNavigationTypeMobile" "StepNavigationType" NOT NULL DEFAULT 'STICKY';
