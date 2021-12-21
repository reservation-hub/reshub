import { Shop } from '@entities/Shop'
import { ShopServiceInterface } from '@dashboard/DashboardController'
import ShopRepository from '@dashboard/repositories/ShopRepository'
import StylistRepository from '@dashboard/repositories/StylistRepository'
import ReservationRepository from '@dashboard/repositories/ReservationRepository'
import { RoleSlug } from '@entities/Role'

export type ShopRepositoryInterface = {
  fetchShops(): Promise<Shop[]>
  totalCount(): Promise<number>
  fetchUserShopsCount(userId: number): Promise<number>
  fetchUserShops(userId: number): Promise<Shop[]>
}

export type StylistRepositoryInterface = {
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ shopId: number, stylistCount: number }[]>,
}

export type ReservationRepositoryInterface = {
  fetchReservationsCountByShopIds(shopIds: number[]) : Promise<{ shopId: number, reservationCount: number }[]>
}

export const ShopService: ShopServiceInterface = {

  async fetchShopsWithStylistCountsAndReservationCounts(user) {
    let shops: Shop[] = []
    let shopsTotalCount: number
    if (user?.role.slug === RoleSlug.SHOP_STAFF) {
      shops = await ShopRepository.fetchUserShops(user.id)
      shopsTotalCount = await ShopRepository.fetchUserShopsCount(user.id)
    } else {
      shops = await ShopRepository.fetchShops()
      shopsTotalCount = await ShopRepository.totalCount()
    }
    const shopIds = shops.map(s => s.id)
    const shopReservationCounts = await ReservationRepository.fetchReservationsCountByShopIds(shopIds)
    const shopStylistCounts = await StylistRepository.fetchStylistsCountByShopIds(shopIds)

    return {
      shops: shops.map(s => ({
        ...s,
        reservationCount: shopReservationCounts.find(src => src.shopId === s.id)!.reservationCount,
        stylistCount: shopStylistCounts.find(ssc => ssc.shopId === s.id)!.stylistCount,
      })),
      totalCount: shopsTotalCount,
    }
  },

}

export default ShopService
