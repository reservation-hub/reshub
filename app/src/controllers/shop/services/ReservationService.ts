import { ReservationServiceInterface } from '@shop/ShopController'
import ReservationRepository from '@shop/repositories/ReservationRepository'
import { AuthorizationError } from '@errors/ServiceErrors'
import { RoleSlug } from '@entities/Role'
import ShopRepository from '@shop/repositories/ShopRepository'
import { Reservation } from '@entities/Reservation'
import Logger from '@lib/Logger'

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
}

export type ReservationRepositoryInterface = {
  fetchReservationsCountByShopIds(shopIds: number[]) : Promise<{ shopId: number, reservationCount: number }[]>
  fetchShopReservations(shopId: number, limit: number): Promise<Reservation[]>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const ReservationService: ReservationServiceInterface = {
  async fetchReservationsCountByShopIds(shopIds) {
    return ReservationRepository.fetchReservationsCountByShopIds(shopIds)
  },

  async fetchShopReservations(user, shopId, limit = 10) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    return ReservationRepository.fetchShopReservations(shopId, limit)
  },

}

export default ReservationService
