/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `contact_info` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contact_info_id_key" ON "contact_info"("id");
