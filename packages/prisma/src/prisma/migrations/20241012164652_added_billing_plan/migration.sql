-- CreateEnum
CREATE TYPE "PricingPlan" AS ENUM ('BASIC', 'PRO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeBillingPlan" "PricingPlan" NOT NULL DEFAULT 'BASIC';
