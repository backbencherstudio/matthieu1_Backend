-- CreateEnum
CREATE TYPE "Discpline" AS ENUM ('JUMPING', 'DRESSAGE', 'CROSS_COUNTRY');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('BLACK', 'LIGHT_BROWN', 'DARK_BROWN');

-- CreateTable
CREATE TABLE "CustomerAlert" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "priceMin" DOUBLE PRECISION NOT NULL,
    "priceMax" DOUBLE PRECISION NOT NULL,
    "brand" TEXT NOT NULL,
    "discpline" "Discpline" NOT NULL,
    "seatsSize" TEXT NOT NULL,
    "color" "Color" NOT NULL,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAlert_alertId_key" ON "CustomerAlert"("alertId");
