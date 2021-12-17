/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `slug` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleSlug" AS ENUM ('ADMIN', 'SHOP_STAFF', 'CLIENT');

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "slug",
ADD COLUMN     "slug" "RoleSlug" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Role.slug_unique" ON "Role"("slug");
