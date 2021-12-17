/*
  Warnings:

  - You are about to drop the column `user_id` on the `UserProfile` table. All the data in the column will be lost.
  - The `gender` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[menu_id]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_detail_id]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `menu_id` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_detail_id` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `roleId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "ShopDetail" DROP CONSTRAINT "ShopDetail_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_user_id_fkey";

-- DropIndex
DROP INDEX "UserProfile.user_id_unique";

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "menu_id" INTEGER NOT NULL,
ADD COLUMN     "shop_detail_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile_id" INTEGER NOT NULL,
ALTER COLUMN "roleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "user_id",
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";

-- CreateIndex
CREATE UNIQUE INDEX "Shop.menu_id_unique" ON "Shop"("menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shop.shop_detail_id_unique" ON "Shop"("shop_detail_id");

-- CreateIndex
CREATE UNIQUE INDEX "User.profile_id_unique" ON "User"("profile_id");

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("profile_id") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD FOREIGN KEY ("menu_id") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD FOREIGN KEY ("shop_detail_id") REFERENCES "ShopDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
