/*
  Warnings:

  - Added the required column `brand` to the `UsedSaddle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discipline` to the `UsedSaddle` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `seatSize` on the `UsedSaddle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Brand" AS ENUM ('BUTET', 'CWD', 'DEVOUCOUX', 'FORSTIER', 'MEYER', 'VOLTAIRE');

-- CreateEnum
CREATE TYPE "SeatSize" AS ENUM ('17', '17.5', '18');

-- AlterTable
ALTER TABLE "UsedSaddle" ADD COLUMN     "brand" "Brand" NOT NULL,
ADD COLUMN     "discipline" "Discpline" NOT NULL,
DROP COLUMN "seatSize",
ADD COLUMN     "seatSize" "SeatSize" NOT NULL;
