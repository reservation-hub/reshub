/*
  Warnings:

  - You are about to drop the `UserRoles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roleId" INTEGER;

-- DropTable
DROP TABLE "UserRoles";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
