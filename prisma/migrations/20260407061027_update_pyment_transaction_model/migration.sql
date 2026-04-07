/*
  Warnings:

  - A unique constraint covering the columns `[custom_transaction_id]` on the table `payment_transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `payment_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "client_secret" TEXT,
ADD COLUMN     "custom_transaction_id" TEXT,
ADD COLUMN     "payment_gateway" TEXT DEFAULT 'stripe',
ADD COLUMN     "payment_intent_id" TEXT,
ADD COLUMN     "payment_method_id" TEXT DEFAULT 'card';

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_custom_transaction_id_key" ON "payment_transactions"("custom_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_order_id_key" ON "payment_transactions"("order_id");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
