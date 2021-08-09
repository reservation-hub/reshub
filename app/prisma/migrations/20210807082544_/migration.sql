/*
  Warnings:

  - You are about to drop the column `menu_id` on the `Shop` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_menu_id_fkey";

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "menu_id";

-- AddForeignKey
ALTER TABLE "Menu" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterIndex
ALTER INDEX "Menu.shop_id_unique" RENAME TO "Menu_shop_id_unique";
