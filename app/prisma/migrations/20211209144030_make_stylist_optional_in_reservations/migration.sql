-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_stylist_id_fkey";

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "stylist_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
