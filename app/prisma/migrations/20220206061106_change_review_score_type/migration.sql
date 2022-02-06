/*
  Warnings:

  - The `score` column on the `Review` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "score",
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "ReviewScore";
