/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the `BlogCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogDescription` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageDescription` to the `BlogContentImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Blog_Category" AS ENUM ('RIDER_SPOTLIGHTS', 'SPORT_HIGHLIGHTS', 'ON_THE_ROAD', 'ARION_WORLD');

-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "BlogDescription" DROP CONSTRAINT "BlogDescription_blogId_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "categoryId",
ADD COLUMN     "category" "Blog_Category" NOT NULL,
ADD COLUMN     "descriptions" TEXT;

-- AlterTable
ALTER TABLE "BlogContentImage" ADD COLUMN     "imageDescription" TEXT NOT NULL;

-- DropTable
DROP TABLE "BlogCategory";

-- DropTable
DROP TABLE "BlogDescription";
