-- DropIndex
DROP INDEX "contact_info_id_key";

-- CreateTable
CREATE TABLE "contact_infos" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "fb_link" TEXT,
    "instagram_link" TEXT,
    "tiktok_link" TEXT,
    "youtube_link" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_infos_pkey" PRIMARY KEY ("id")
);
