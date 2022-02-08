/*
  Warnings:

  - You are about to drop the column `shop_for_search` on the `ShopDetail` table. All the data in the column will be lost.
  - Added the required column `name_for_search` to the `ShopDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShopDetail" DROP COLUMN "shop_for_search",
ADD COLUMN     "name_for_search" VARCHAR(255) NOT NULL;
