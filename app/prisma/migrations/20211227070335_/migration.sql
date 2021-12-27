/*
  Warnings:

  - Added the required column `seats` to the `ShopDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShopDetail" ADD COLUMN     "seats" INTEGER NOT NULL;
