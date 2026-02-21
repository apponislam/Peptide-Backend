-- CreateTable
CREATE TABLE "OrderPreview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shipping" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderPreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderPreview_userId_idx" ON "OrderPreview"("userId");

-- CreateIndex
CREATE INDEX "OrderPreview_expiresAt_idx" ON "OrderPreview"("expiresAt");

-- AddForeignKey
ALTER TABLE "OrderPreview" ADD CONSTRAINT "OrderPreview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
