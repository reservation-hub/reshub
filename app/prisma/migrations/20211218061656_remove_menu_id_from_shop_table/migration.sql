/*
  Warnings:

  - You are about to drop the column `menu_id` on the `Shop` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Shop.menu_id_unique";

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "menu_id";
