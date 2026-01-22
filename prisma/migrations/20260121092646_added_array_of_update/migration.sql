/*
  Warnings:

  - The `colors` column on the `saddles_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `piping_color` column on the `saddles_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `leather_type` column on the `saddles_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "saddles_products" DROP COLUMN "colors",
ADD COLUMN     "colors" TEXT[],
DROP COLUMN "piping_color",
ADD COLUMN     "piping_color" TEXT[],
DROP COLUMN "leather_type",
ADD COLUMN     "leather_type" TEXT[];
