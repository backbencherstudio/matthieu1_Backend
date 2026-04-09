-- CreateEnum
CREATE TYPE "TrialPeriod" AS ENUM ('NO_TRIAL', 'TRIAL_7_DAYS', 'TRIAL_14_DAYS');

-- CreateTable
CREATE TABLE "UsedSaddle" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seatSize" TEXT NOT NULL,
    "category" "productcategory" NOT NULL,
    "usedsaddlecategory" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsedSaddle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedSaddleImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "UsedSaddleId" TEXT NOT NULL,

    CONSTRAINT "UsedSaddleImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsedSaddle_sku_key" ON "UsedSaddle"("sku");

-- AddForeignKey
ALTER TABLE "UsedSaddleImage" ADD CONSTRAINT "UsedSaddleImage_UsedSaddleId_fkey" FOREIGN KEY ("UsedSaddleId") REFERENCES "UsedSaddle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
