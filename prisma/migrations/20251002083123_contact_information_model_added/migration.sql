/*
  Warnings:

  - Made the column `post_id` on table `notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."notifications" ALTER COLUMN "post_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."ContactInformation" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "facebook" VARCHAR(255),
    "instagram" VARCHAR(255),
    "tiktok" VARCHAR(255),
    "youtube" VARCHAR(255),

    CONSTRAINT "ContactInformation_pkey" PRIMARY KEY ("id")
);
