-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Brand" ADD VALUE 'AMERIGO';
ALTER TYPE "Brand" ADD VALUE 'ANTARES';
ALTER TYPE "Brand" ADD VALUE 'ARION';
ALTER TYPE "Brand" ADD VALUE 'ERREPLUS';
ALTER TYPE "Brand" ADD VALUE 'HERMES';
ALTER TYPE "Brand" ADD VALUE 'N2_SADDLERY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SeatSize" ADD VALUE '16.5';
ALTER TYPE "SeatSize" ADD VALUE '18.5';
