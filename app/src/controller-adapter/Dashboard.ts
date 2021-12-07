import {
  Request, Response, NextFunction, Router,
} from 'express'
import dashboardController from '@controllers/dashboardController'
import { User } from '@entities/User'
import { roleCheck } from '@routes/utils'
import { salonIndexAdminResponse, salonIndexShopStaffResponse } from '@request-response-types/Dashboard'

export type DashboardControllerInterface = {
  salon(user: User) : Promise<salonIndexAdminResponse | salonIndexShopStaffResponse>
}

const salonRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User
    return res.send(await dashboardController.salon(user))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/salon', roleCheck(['admin', 'shop_staff']), salonRoute)

export default routes
