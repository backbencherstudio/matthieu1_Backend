/*
  Warnings:

  - You are about to drop the column `productId` on the `favorites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,baseProductId]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseProductId` to the `favorites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."favorites" DROP CONSTRAINT "favorites_productId_fkey";

-- DropIndex
DROP INDEX "public"."favorites_userId_productId_key";

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "productId",
ADD COLUMN     "baseProductId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_baseProductId_key" ON "favorites"("userId", "baseProductId");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_baseProductId_fkey" FOREIGN KEY ("baseProductId") REFERENCES "BaseProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
