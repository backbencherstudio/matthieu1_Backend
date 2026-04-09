-- AlterTable
ALTER TABLE "TackProduct" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'USA';

-- AlterTable
ALTER TABLE "UsedSaddle" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'USA';

-- AlterTable
ALTER TABLE "saddles_products" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'USA';
