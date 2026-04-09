-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_colorId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_sizeId_fkey";

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "color"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "size"("id") ON DELETE CASCADE ON UPDATE CASCADE;
