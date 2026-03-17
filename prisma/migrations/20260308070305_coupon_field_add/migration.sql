-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "coupon" ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "maxDiscount" DOUBLE PRECISION;
