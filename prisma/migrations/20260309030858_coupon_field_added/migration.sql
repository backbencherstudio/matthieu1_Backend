/*
  Warnings:

  - You are about to drop the column `maxDiscount` on the `coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "coupon" DROP COLUMN "maxDiscount",
ADD COLUMN     "maxDiscount_eur" DOUBLE PRECISION,
ADD COLUMN     "maxDiscount_usd" DOUBLE PRECISION;
