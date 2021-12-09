-- DropForeignKey
ALTER TABLE "ShopUser" DROP CONSTRAINT "ShopUser_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "ShopUser" DROP CONSTRAINT "ShopUser_user_id_fkey";

-- AddForeignKey
ALTER TABLE "ShopUser" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopUser" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
