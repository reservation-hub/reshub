/*
  Warnings:

  - Added the required column `score` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "score" "ReviewScore" NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;
