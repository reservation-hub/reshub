-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_shop_id_fkey";

-- AddForeignKey
ALTER TABLE "Menu" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
