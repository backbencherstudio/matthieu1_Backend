/*
  Warnings:

  - A unique constraint covering the columns `[BaseproductId,colorId,sizeId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Variant_BaseproductId_color_size_key";

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "colorId" TEXT,
ADD COLUMN     "sizeId" TEXT;

-- CreateIndex
CREATE INDEX "Variant_colorId_idx" ON "Variant"("colorId");

-- CreateIndex
CREATE INDEX "Variant_sizeId_idx" ON "Variant"("sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_BaseproductId_colorId_sizeId_key" ON "Variant"("BaseproductId", "colorId", "sizeId");

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
