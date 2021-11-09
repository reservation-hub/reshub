import { Router } from 'express'
import { Shop } from '../entities/Shop'
import { User } from '../entities/User'
import { roleCheck } from '../routes/utils'
import ShopService from '../services/ShopService'
import UserService from '../services/UserService'
import { salonIndexResponse } from '../request-response-types/Dashboard'
import { CustomRequest } from './controller-adapter/Models/Request'
import ControllerAdapter from './controller-adapter'

export type UserServiceInterface = {
  fetchUsersForDashboard(): Promise<{ users: User[], totalCount: number }>
}

export type ShopServiceInterface = {
  fetchShopsForDashboard(): Promise<{ shops: Shop[], totalCount: number }>
}

export const salon = async (req: CustomRequest) : Promise<salonIndexResponse> => {
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

const routes = Router()

routes.get('/salon', roleCheck(['admin']), ControllerAdapter(salon))

export default routes
