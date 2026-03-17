/*
  Warnings:

  - The values [Flat] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('PERCENTAGE', 'FLAT');
ALTER TABLE "public"."coupon" ALTER COLUMN "discountType" DROP DEFAULT;
ALTER TABLE "coupon" ALTER COLUMN "discountType" TYPE "DiscountType_new" USING ("discountType"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "public"."DiscountType_old";
ALTER TABLE "coupon" ALTER COLUMN "discountType" SET DEFAULT 'PERCENTAGE';
COMMIT;
