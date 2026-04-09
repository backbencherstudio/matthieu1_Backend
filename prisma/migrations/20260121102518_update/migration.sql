/*
  Warnings:

  - The values [GRITHS] on the enum `tackSubcategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "tackSubcategory_new" AS ENUM ('BRIDLES', 'REINS', 'MARTINGALES', 'GRITHSF', 'STIRRUP_LEATHERS', 'PADS', 'RIDER_APPAREL', 'BOOTS', 'ACCESSORIES');
ALTER TYPE "tackSubcategory" RENAME TO "tackSubcategory_old";
ALTER TYPE "tackSubcategory_new" RENAME TO "tackSubcategory";
DROP TYPE "public"."tackSubcategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "saddleProductId" TEXT,
ALTER COLUMN "baseProductId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_saddleProductId_fkey" FOREIGN KEY ("saddleProductId") REFERENCES "saddles_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
