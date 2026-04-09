-- CreateEnum
CREATE TYPE "try_saddle_discipline" AS ENUM ('HUNTER', 'JUMPER', 'EQUTATION', 'DRESSAGE', 'CROSS_COUNTRY', 'OTHER');

-- CreateTable
CREATE TABLE "try_saddles" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "discipline" "try_saddle_discipline" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "try_saddles_pkey" PRIMARY KEY ("id")
);
