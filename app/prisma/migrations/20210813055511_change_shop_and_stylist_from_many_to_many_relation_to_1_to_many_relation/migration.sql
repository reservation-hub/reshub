/*
  Warnings:

  - You are about to drop the `ShopStylists` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shop_id` to the `Stylist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShopStylists" DROP CONSTRAINT "ShopStylists_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "ShopStylists" DROP CONSTRAINT "ShopStylists_stylist_id_fkey";

-- AlterTable
ALTER TABLE "Stylist" ADD COLUMN     "shop_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ShopStylists";

-- AddForeignKey
ALTER TABLE "Stylist" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
