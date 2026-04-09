/*
  Warnings:

  - Added the required column `stockQuantity` to the `UsedSaddle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UsedSaddle" ADD COLUMN     "stockQuantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "saddles_products" ADD COLUMN     "stockQuantity" INTEGER;
