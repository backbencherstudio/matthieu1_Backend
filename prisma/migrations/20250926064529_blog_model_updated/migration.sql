/*
  Warnings:

  - You are about to drop the `blogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."blogs" DROP CONSTRAINT "blogs_authorId_fkey";

-- DropTable
DROP TABLE "public"."blogs";

-- CreateTable
CREATE TABLE "public"."Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "thumbnailImageUrl" TEXT,
    "thumbnailVideoUrl" TEXT,
    "descriptions" TEXT[],
    "tags" TEXT[],
    "categoryId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogContentImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageTitle" TEXT NOT NULL,
    "imageDetail" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogContentImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogContentImage" ADD CONSTRAINT "BlogContentImage_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
