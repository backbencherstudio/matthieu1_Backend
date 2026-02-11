/*
  Warnings:

  - The `subcategory` column on the `TackProduct` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TackProduct" DROP COLUMN "subcategory",
ADD COLUMN     "subcategory" "tackSubcategory";
