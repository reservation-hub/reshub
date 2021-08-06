/*
  Warnings:

  - You are about to drop the column `stylistID` on the `ModelImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stylistId]` on the table `ModelImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ModelImage" DROP CONSTRAINT "ModelImage_stylistID_fkey";

-- DropIndex
DROP INDEX "ModelImage.stylistID_unique";

-- AlterTable
ALTER TABLE "ModelImage" DROP COLUMN "stylistID",
ADD COLUMN     "stylistId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ModelImage.stylistId_unique" ON "ModelImage"("stylistId");

-- AddForeignKey
ALTER TABLE "ModelImage" ADD FOREIGN KEY ("stylistId") REFERENCES "Stylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
