-- AlterTable
ALTER TABLE "ShopDetail" ADD COLUMN     "details" VARCHAR(255);

-- RenameIndex
ALTER INDEX "Area.slug_unique" RENAME TO "Area_slug_key";

-- RenameIndex
ALTER INDEX "City.slug_unique" RENAME TO "City_slug_key";

-- RenameIndex
ALTER INDEX "Menu.shop_id_unique" RENAME TO "Menu_shop_id_key";

-- RenameIndex
ALTER INDEX "MenuItem.image_id_unique" RENAME TO "MenuItem_image_id_key";

-- RenameIndex
ALTER INDEX "ModelImage.image_id_unique" RENAME TO "ModelImage_image_id_key";

-- RenameIndex
ALTER INDEX "ModelImage.stylistId_unique" RENAME TO "ModelImage_stylistId_key";

-- RenameIndex
ALTER INDEX "Prefecture.slug_unique" RENAME TO "Prefecture_slug_key";

-- RenameIndex
ALTER INDEX "Role.slug_unique" RENAME TO "Role_slug_key";

-- RenameIndex
ALTER INDEX "ShopDetail.shop_id_unique" RENAME TO "ShopDetail_shop_id_key";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";

-- RenameIndex
ALTER INDEX "User.username_unique" RENAME TO "User_username_key";

-- RenameIndex
ALTER INDEX "UserOAuthIds.facebook_id_unique" RENAME TO "UserOAuthIds_facebook_id_key";

-- RenameIndex
ALTER INDEX "UserOAuthIds.google_id_unique" RENAME TO "UserOAuthIds_google_id_key";

-- RenameIndex
ALTER INDEX "UserOAuthIds.user_id_unique" RENAME TO "UserOAuthIds_user_id_key";

-- RenameIndex
ALTER INDEX "UserProfile.user_id_unique" RENAME TO "UserProfile_user_id_key";
