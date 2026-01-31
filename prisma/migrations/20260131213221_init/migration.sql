-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentIntentId" TEXT NOT NULL DEFAULT 'no-payment';

-- CreateIndex
CREATE INDEX "Order_paymentIntentId_idx" ON "Order"("paymentIntentId");
