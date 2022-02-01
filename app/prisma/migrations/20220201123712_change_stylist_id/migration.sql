/*
  Warnings:

  - You are about to drop the column `stylistId` on the `ModelImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stylist_id]` on the table `ModelImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ModelImage" DROP CONSTRAINT "ModelImage_stylistId_fkey";

-- DropIndex
DROP INDEX "ModelImage.stylistId_unique";

-- AlterTable
ALTER TABLE "ModelImage" DROP COLUMN "stylistId",
ADD COLUMN     "stylist_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ModelImage.stylist_id_unique" ON "ModelImage"("stylist_id");

-- AddForeignKey
ALTER TABLE "ModelImage" ADD FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
