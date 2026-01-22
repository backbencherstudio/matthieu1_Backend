-- CreateEnum
CREATE TYPE "productcategory" AS ENUM ('SADDLES', 'TACK', 'LEADLINE', 'USED');

-- CreateEnum
CREATE TYPE "saddleSubcategory" AS ENUM ('ATLAS', 'ARION', 'ATHENA');

-- CreateEnum
CREATE TYPE "tackSubcategory" AS ENUM ('BRIDLES', 'REINS', 'MARTINGALES', 'GRITHS', 'STIRRUP_LEATHERS', 'PADS', 'RIDER_APPAREL', 'BOOTS', 'ACCESSORIES');

-- CreateTable
CREATE TABLE "saddles_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "header_title" TEXT,
    "header_description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "colors" TEXT,
    "category" "productcategory" NOT NULL,
    "subcategory" "saddleSubcategory" NOT NULL,
    "piping_color" TEXT,
    "leather_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saddles_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaddleProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "SaddlesProductId" TEXT NOT NULL,

    CONSTRAINT "SaddleProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saddles_products_sku_key" ON "saddles_products"("sku");

-- AddForeignKey
ALTER TABLE "SaddleProductImage" ADD CONSTRAINT "SaddleProductImage_SaddlesProductId_fkey" FOREIGN KEY ("SaddlesProductId") REFERENCES "saddles_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
