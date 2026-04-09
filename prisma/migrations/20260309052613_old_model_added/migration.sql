/*
  Warnings:

  - You are about to drop the column `discountType` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscount_eur` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscount_usd` on the `coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "coupon" DROP COLUMN "discountType",
DROP COLUMN "maxDiscount_eur",
DROP COLUMN "maxDiscount_usd";

-- DropEnum
DROP TYPE "DiscountType";
