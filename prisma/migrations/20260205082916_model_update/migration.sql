/*
  Warnings:

  - You are about to drop the column `address1` on the `contact_us` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `contact_us` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `contact_us` table. All the data in the column will be lost.
  - Added the required column `address` to the `contact_us` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contact_us" DROP COLUMN "address1",
DROP COLUMN "address2",
DROP COLUMN "subject",
ADD COLUMN     "address" TEXT NOT NULL;
