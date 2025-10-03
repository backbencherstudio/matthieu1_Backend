-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "public"."Blog" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."BlogStatus" NOT NULL DEFAULT 'DRAFT';
