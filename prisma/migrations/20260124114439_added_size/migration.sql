-- CreateEnum
CREATE TYPE "leadline_size" AS ENUM ('SIZE_12_5', 'SIZE_14_5');

-- AlterTable
ALTER TABLE "saddles_products" ADD COLUMN     "size" "leadline_size";
