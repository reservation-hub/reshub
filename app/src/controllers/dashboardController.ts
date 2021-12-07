import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'
import { User } from '@entities/User'
import { Stylist } from '@entities/Stylist'
import ReservationService from '@services/ReservationService'
import ShopService from '@services/ShopService'
import UserService from '@services/UserService'

import { DashboardControllerInterface } from '@controller-adapter/Dashboard'

export type UserServiceInterface = {
  fetchUsersForDashboard(): Promise<{ users: User[], totalCount: number }>
}

export type ShopServiceInterface = {
  fetchShopsForDashboard(): Promise<{ shops: Shop[], totalCount: number }>
  fetchShopsForDashboardForShopStaff(user: User): Promise<{ shops: Shop[], totalCount: number }>
  fetchShopsStylists(shops: Shop[]): Promise<Stylist[]>
  // fetchShopsPopularMenus(shops: Shop[]): Promise<MenuItem[]>
}

export type ReservationServiceInterface = {
  fetchShopsReservations(shops: Shop[]): Promise<Reservation[]>
}

const salonIndexForAdmin = async () => {
  const { users, totalCount: userTotalCount } = await UserService.fetchUsersForDashboard()
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsForDashboard()
  const shopIds = shops.map(shop => shop.id)
  const stylistCounts = await ShopService.fetchStylistsCountByShopIds(shopIds)
  const reservationCounts = await ShopService.fetchReservationsCountByShopIds(shopIds)
  const shopData = shops.map(shop => ({
    ...shop,
    reservationsCount: reservationCounts.find(item => item.id === shop.id)!.count,
    stylistsCount: stylistCounts.find(item => item.id === shop.id)!.count,
  }))

  return {
    user: { users, totalCount: userTotalCount },
    shop: { shopData, totalCount: shopTotalCount },
  }
}

const salonIndexForShopStaff = async (user: User) => {
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsForDashboardForShopStaff(user)
  // reservations
  const reservations = await ReservationService.fetchShopsReservations(shops)

  // stylists
  const stylists = await ShopService.fetchShopsStylists(shops)

  // popular menu
  // TODO: implement
  return {
    shops, shopTotalCount, stylists, reservations,
  }
}

const DashboardController : DashboardControllerInterface = {
  async salon(user) {
    if (user.role.slug === 'shop_staff') {
      return salonIndexForShopStaff(user)
    }
    return salonIndexForAdmin()
  },

}

export default DashboardController
