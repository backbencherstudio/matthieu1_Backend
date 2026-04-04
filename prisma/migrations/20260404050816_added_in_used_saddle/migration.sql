/*
  Warnings:

  - Added the required column `discipline` to the `UsedSaddle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UsedSaddle" ADD COLUMN     "discipline" "Discpline" NOT NULL;
