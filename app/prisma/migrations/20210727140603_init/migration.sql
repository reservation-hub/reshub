-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255),
    "password" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "first_name_kanji" VARCHAR(255) NOT NULL,
    "last_name_kanji" VARCHAR(255) NOT NULL,
    "first_name_kana" VARCHAR(255) NOT NULL,
    "last_name_kana" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(15),
    "address" VARCHAR(255),
    "user_id" INTEGER NOT NULL,
    "gender" CHAR(1),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOAuthIds" (
    "id" SERIAL NOT NULL,
    "facebook_id" TEXT,
    "google_id" TEXT,
    "user_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "slug" VARCHAR(32) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "slug" VARCHAR(32) NOT NULL,
    "area_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "prefecture_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "area_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prefecture_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "image_id" INTEGER,
    "menu_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopDetail" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "phone_number" VARCHAR(255),
    "shop_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelImage" (
    "id" SERIAL NOT NULL,
    "image_id" INTEGER NOT NULL,
    "shop_detail_id" INTEGER,
    "stylistID" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stylist" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(28) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopStylists" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "stylist_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "stylist_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reservation_date" TIMESTAMP(6) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile.user_id_unique" ON "UserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOAuthIds.facebook_id_unique" ON "UserOAuthIds"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOAuthIds.google_id_unique" ON "UserOAuthIds"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOAuthIds.user_id_unique" ON "UserOAuthIds"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role.slug_unique" ON "Role"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Area.slug_unique" ON "Area"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Prefecture.slug_unique" ON "Prefecture"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City.slug_unique" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Menu.shop_id_unique" ON "Menu"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem.image_id_unique" ON "MenuItem"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem.menu_id_unique" ON "MenuItem"("menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShopDetail.shop_id_unique" ON "ShopDetail"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "ModelImage.image_id_unique" ON "ModelImage"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "ModelImage.stylistID_unique" ON "ModelImage"("stylistID");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOAuthIds" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prefecture" ADD FOREIGN KEY ("area_id") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD FOREIGN KEY ("prefecture_id") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD FOREIGN KEY ("area_id") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD FOREIGN KEY ("prefecture_id") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD FOREIGN KEY ("image_id") REFERENCES "ModelImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD FOREIGN KEY ("menu_id") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopDetail" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelImage" ADD FOREIGN KEY ("image_id") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelImage" ADD FOREIGN KEY ("shop_detail_id") REFERENCES "ShopDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelImage" ADD FOREIGN KEY ("stylistID") REFERENCES "Stylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopStylists" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopStylists" ADD FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
