import { Shop } from '../entities/Shop'
import { User } from '../entities/User'
import ShopService from '../services/ShopService'
import UserService from '../services/UserService'
import { DashboardControllerInterface } from '../controller-adapter/Dashboard'

export type UserServiceInterface = {
  fetchUsersForDashboard(): Promise<{ users: User[], totalCount: number }>
}

export type ShopServiceInterface = {
  fetchShopsForDashboard(): Promise<{ shops: Shop[], totalCount: number }>
}

const DashboardController : DashboardControllerInterface = {
  async salon() {
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
  },
}

export default DashboardController
