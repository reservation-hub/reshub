/*
  Warnings:

  - Added the required column `shop_for_search` to the `ShopDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShopDetail" ADD COLUMN     "shop_for_search" VARCHAR(255) NOT NULL;
