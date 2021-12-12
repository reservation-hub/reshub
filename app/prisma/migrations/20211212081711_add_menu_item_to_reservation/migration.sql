/*
  Warnings:

  - Added the required column `menu_item_id` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "menu_item_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
