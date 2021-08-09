/*
  Warnings:

  - Added the required column `menu_id` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_shop_id_fkey";

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "menu_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Shop" ADD FOREIGN KEY ("menu_id") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
