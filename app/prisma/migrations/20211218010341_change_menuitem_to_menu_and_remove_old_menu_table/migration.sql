/*
  Warnings:

  - You are about to drop the column `menu_item_id` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[image_id]` on the table `Menu` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Made the column `shop_id` on table `Menu` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `menu_id` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_image_id_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_menu_item_id_fkey";

-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_menu_id_fkey";

-- DropIndex
DROP INDEX "Menu.shop_id_unique";

-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "image_id" INTEGER,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ALTER COLUMN "shop_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "menu_item_id",
ADD COLUMN     "menu_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "MenuItem";

-- CreateIndex
CREATE UNIQUE INDEX "Menu.image_id_unique" ON "Menu"("image_id");

-- AddForeignKey
ALTER TABLE "Menu" ADD FOREIGN KEY ("image_id") REFERENCES "ModelImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("menu_id") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
