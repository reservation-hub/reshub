-- CreateTable
CREATE TABLE "ShopUser" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopUser.shop_id_unique" ON "ShopUser"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShopUser.user_id_unique" ON "ShopUser"("user_id");

-- AddForeignKey
ALTER TABLE "ShopUser" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopUser" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
