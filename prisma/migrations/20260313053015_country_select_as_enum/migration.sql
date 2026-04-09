/*
  Warnings:

  - Changed the type of `country` on the `TackProduct` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `country` on the `UsedSaddle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `country` on the `saddles_products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "saddlecountry" AS ENUM ('USA', 'EUROPE');

-- AlterTable
ALTER TABLE "TackProduct" DROP COLUMN "country",
ADD COLUMN     "country" "saddlecountry" NOT NULL;

-- AlterTable
ALTER TABLE "UsedSaddle" DROP COLUMN "country",
ADD COLUMN     "country" "saddlecountry" NOT NULL;

-- AlterTable
ALTER TABLE "saddles_products" DROP COLUMN "country",
ADD COLUMN     "country" "saddlecountry" NOT NULL;
