/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "imgUrl",
ADD COLUMN     "image" TEXT;
