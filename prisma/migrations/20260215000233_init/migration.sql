-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image" TEXT,
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true;
