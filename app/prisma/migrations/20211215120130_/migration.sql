/*
  Warnings:

  - Added the required column `end_date` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "end_date" TIMESTAMP(6) NOT NULL;
