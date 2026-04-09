/*
  Warnings:

  - You are about to drop the column `sizes` on the `saddles_products` table. All the data in the column will be lost.
  - Added the required column `size` to the `saddles_products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "saddleSize" AS ENUM ('SIZE_12_5', 'SIZE_14_5');

-- AlterTable
ALTER TABLE "saddles_products" DROP COLUMN "sizes",
ADD COLUMN     "size" "saddleSize" NOT NULL;
