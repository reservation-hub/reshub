import {
  Request, Response, NextFunction, Router,
} from 'express'
import dashboardController from '@dashboard/DashboardController'
import { UserForAuth } from '@entities/User'
import { salonIndexAdminResponse, salonIndexShopStaffResponse } from '@request-response-types/Dashboard'

export type DashboardControllerInterface = {
  salon(user: UserForAuth | undefined) : Promise<salonIndexAdminResponse | salonIndexShopStaffResponse>
}

const salonRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req
    return res.send(await dashboardController.salon(user))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/salon', salonRoute)

export default routes
