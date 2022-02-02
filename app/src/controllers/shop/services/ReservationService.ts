import { ReservationServiceInterface } from '@shop/ShopController'
import ReservationRepository from '@shop/repositories/ReservationRepository'
import { AuthorizationError } from '@errors/ServiceErrors'
import { RoleSlug } from '@entities/Role'
import ShopRepository from '@shop/repositories/ShopRepository'
import { Reservation } from '@entities/Reservation'

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
}

export type ReservationRepositoryInterface = {
  fetchReservationsCountByShopIds(shopIds: number[]) : Promise<{ shopId: number, reservationCount: number }[]>
  fetchShopReservations(shopId: number, limit: number): Promise<Reservation[]>
  fetchCompletedShopReservationsWithStylistPriceAndMenuPrice(shopId: number)
  :Promise< {id: number, shopId: number, stylistPrice?: number, menuPrice: number}[]>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const ReservationService: ReservationServiceInterface = {
  async fetchReservationsCountByShopIds(shopIds) {
    const reservationCounts = await ReservationRepository.fetchReservationsCountByShopIds(shopIds)
    return shopIds.map(id => ({
      shopId: id,
      reservationCount: reservationCounts.find(rc => rc.shopId === id)?.reservationCount ?? 0,
    }))
  },

  async fetchShopReservations(user, shopId, limit = 10) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    return ReservationRepository.fetchShopReservations(shopId, limit)
  },

  async getTotalSalesForShopForCurrentMonth(shopId) {
    const completedReservations = await
    ReservationRepository.fetchCompletedShopReservationsWithStylistPriceAndMenuPrice(
      shopId,
    )
    return completedReservations.reduce((sum, r) => sum + r.menuPrice + (r.stylistPrice ?? 0), 0)
  },
}

export default ReservationService
