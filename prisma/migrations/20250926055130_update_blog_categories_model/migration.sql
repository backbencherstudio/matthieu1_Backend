/*
  Warnings:

  - You are about to drop the `_BlogToBlogCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_BlogToBlogCategory" DROP CONSTRAINT "_BlogToBlogCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_BlogToBlogCategory" DROP CONSTRAINT "_BlogToBlogCategory_B_fkey";

-- DropTable
DROP TABLE "public"."_BlogToBlogCategory";
