import { StylistServiceInterface } from '@shop/ShopController'

import { RoleSlug } from '@entities/Role'
import { Stylist } from '@entities/Stylist'
import ShopRepository from '@shop/repositories/ShopRepository'
import StylistRepository from '@shop/repositories/StylistRepository'
import { AuthorizationError } from '@shop/services/ServiceError'

export type StylistRepositoryInterface = {
  fetchShopStylistsWithReservationCounts(shopId: number, limit: number)
    : Promise<(Stylist & { reservationCount: number})[]>
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ shopId: number, stylistCount: number}[]>
}

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const StylistService: StylistServiceInterface = {
  async fetchShopStylistsWithReservationCount(user, shopId, limit = 5) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    return StylistRepository.fetchShopStylistsWithReservationCounts(shopId, limit)
  },

  async fetchStylistsCountByShopIds(shopIds) {
    return StylistRepository.fetchStylistsCountByShopIds(shopIds)
  },
}

export default StylistService
