-- CreateTable
CREATE TABLE "ambassadors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "social_links" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambassadors_pkey" PRIMARY KEY ("id")
);
