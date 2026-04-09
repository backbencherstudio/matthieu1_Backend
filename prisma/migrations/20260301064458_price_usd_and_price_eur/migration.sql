/*
  Warnings:

  - You are about to drop the column `basePrice` on the `UsedSaddle` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `saddles_products` table. All the data in the column will be lost.
  - Added the required column `basePrice_eur` to the `UsedSaddle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice_usd` to the `UsedSaddle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_eur` to the `saddles_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_usd` to the `saddles_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UsedSaddle" DROP COLUMN "basePrice",
ADD COLUMN     "basePrice_eur" INTEGER NOT NULL,
ADD COLUMN     "basePrice_usd" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "saddles_products" DROP COLUMN "price",
ADD COLUMN     "price_eur" TEXT NOT NULL,
ADD COLUMN     "price_usd" TEXT NOT NULL;
