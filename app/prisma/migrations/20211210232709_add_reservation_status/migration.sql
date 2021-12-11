-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CANCELLED', 'COMPLETED', 'RESERVED');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT E'RESERVED';
