/*
  Warnings:

  - You are about to drop the column `BaseproductId` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the column `baseProductId` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the `BaseProduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[TackProductId,colorId,sizeId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,tackProductId]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `TackProductId` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BaseProduct" DROP CONSTRAINT "BaseProduct_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "BaseProduct" DROP CONSTRAINT "BaseProduct_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_BaseproductId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_baseProductId_fkey";

-- DropIndex
DROP INDEX "Variant_BaseproductId_colorId_sizeId_key";

-- DropIndex
DROP INDEX "Variant_BaseproductId_idx";

-- DropIndex
DROP INDEX "favorites_userId_baseProductId_key";

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "BaseproductId",
ADD COLUMN     "TackProductId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "baseProductId",
ADD COLUMN     "tackProductId" TEXT;

-- DropTable
DROP TABLE "BaseProduct";

-- CreateTable
CREATE TABLE "TackProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "benefits" TEXT,
    "description" TEXT,
    "leatherCareGuide" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "productcategory" NOT NULL,
    "subcategory" "saddleSubcategory",

    CONSTRAINT "TackProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TackProduct_sku_key" ON "TackProduct"("sku");

-- CreateIndex
CREATE INDEX "Variant_TackProductId_idx" ON "Variant"("TackProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_TackProductId_colorId_sizeId_key" ON "Variant"("TackProductId", "colorId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_tackProductId_key" ON "favorites"("userId", "tackProductId");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_tackProductId_fkey" FOREIGN KEY ("tackProductId") REFERENCES "TackProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_TackProductId_fkey" FOREIGN KEY ("TackProductId") REFERENCES "TackProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
