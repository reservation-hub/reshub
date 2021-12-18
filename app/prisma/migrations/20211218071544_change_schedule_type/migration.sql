/*
  Warnings:

  - You are about to drop the column `schedule` on the `ShopDetail` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `Stylist` table. All the data in the column will be lost.
  - Added the required column `end_time` to the `ShopDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `ShopDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `Stylist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `Stylist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Days" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "ShopDetail" DROP COLUMN "schedule",
ADD COLUMN     "days" "Days"[],
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Stylist" DROP COLUMN "schedule",
ADD COLUMN     "days" "Days"[],
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL;
