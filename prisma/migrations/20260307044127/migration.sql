/*
  Warnings:

  - A unique constraint covering the columns `[userId,usedSaddleProductId]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "usedSaddleProductId" TEXT;

-- CreateTable
CREATE TABLE "coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUsers" INTEGER,
    "maxUsesPerUser" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couponUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "couponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "couponUsage_userId_couponId_key" ON "couponUsage"("userId", "couponId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_usedSaddleProductId_key" ON "favorites"("userId", "usedSaddleProductId");

-- AddForeignKey
ALTER TABLE "couponUsage" ADD CONSTRAINT "couponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_usedSaddleProductId_fkey" FOREIGN KEY ("usedSaddleProductId") REFERENCES "UsedSaddle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
