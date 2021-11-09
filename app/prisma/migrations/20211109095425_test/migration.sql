-- RenameIndex
ALTER INDEX "Area_slug_key" RENAME TO "Area.slug_unique";

-- RenameIndex
ALTER INDEX "City_slug_key" RENAME TO "City.slug_unique";

-- RenameIndex
ALTER INDEX "Menu_shop_id_key" RENAME TO "Menu.shop_id_unique";

-- RenameIndex
ALTER INDEX "MenuItem_image_id_key" RENAME TO "MenuItem.image_id_unique";

-- RenameIndex
ALTER INDEX "ModelImage_image_id_key" RENAME TO "ModelImage.image_id_unique";

-- RenameIndex
ALTER INDEX "ModelImage_stylistId_key" RENAME TO "ModelImage.stylistId_unique";

-- RenameIndex
ALTER INDEX "Prefecture_slug_key" RENAME TO "Prefecture.slug_unique";

-- RenameIndex
ALTER INDEX "Role_slug_key" RENAME TO "Role.slug_unique";

-- RenameIndex
ALTER INDEX "ShopDetail_shop_id_key" RENAME TO "ShopDetail.shop_id_unique";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "User.email_unique";

-- RenameIndex
ALTER INDEX "User_username_key" RENAME TO "User.username_unique";

-- RenameIndex
ALTER INDEX "UserOAuthIds_facebook_id_key" RENAME TO "UserOAuthIds.facebook_id_unique";

-- RenameIndex
ALTER INDEX "UserOAuthIds_google_id_key" RENAME TO "UserOAuthIds.google_id_unique";

-- RenameIndex
ALTER INDEX "UserOAuthIds_user_id_key" RENAME TO "UserOAuthIds.user_id_unique";

-- RenameIndex
ALTER INDEX "UserProfile_user_id_key" RENAME TO "UserProfile.user_id_unique";
