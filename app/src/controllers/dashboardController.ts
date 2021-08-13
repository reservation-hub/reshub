import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { Shop } from '../entities/Shop'
import { User } from '../entities/User'
import { roleCheck } from '../routes/utils'
import ShopService from '../services/ShopService'
import UserService from '../services/UserService'

export type UserServiceInterface = {
  fetchUsersForDashboard(): Promise<{ users: User[], totalCount: number }>
}

export type ShopServiceInterface = {
  fetchShopsForDashboard(): Promise<{ shops: Shop[], totalCount: number }>
}

const salon = asyncHandler(async (req, res) => {
  const { users, totalCount: userTotalCount } = await UserService.fetchUsersForDashboard()
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsForDashboard()
  return res.send({
    user: { users, totalCount: userTotalCount },
    shop: { shops, totalCount: shopTotalCount },
  })
})

const routes = Router()

routes.get('/salon', roleCheck(['admin']), salon)

export default routes
