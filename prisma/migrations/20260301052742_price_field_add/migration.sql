/*
  Warnings:

  - You are about to drop the column `price` on the `Variant` table. All the data in the column will be lost.
  - Added the required column `price_eur` to the `Variant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_usd` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "price",
ADD COLUMN     "price_eur" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_usd" DOUBLE PRECISION NOT NULL;
