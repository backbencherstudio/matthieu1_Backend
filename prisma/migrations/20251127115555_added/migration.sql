/*
  Warnings:

  - You are about to drop the `contact_infos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "contact_infos";

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "fb_link" TEXT,
    "instagram_link" TEXT,
    "tiktok_link" TEXT,
    "youtube_link" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);
