/*
  Warnings:

  - You are about to drop the column `size` on the `saddles_products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "saddles_products" DROP COLUMN "size",
ADD COLUMN     "sizes" TEXT[];

-- DropEnum
DROP TYPE "leadline_size";
