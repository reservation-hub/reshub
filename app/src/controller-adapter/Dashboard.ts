import {
  Request, Response, NextFunction, Router,
} from 'express'
import { roleCheck } from '../routes/utils'
import dashboardController from '../controllers/dashboardController'
import { salonIndexResponse } from '../request-response-types/Dashboard'

export type DashboardControllerInterface = {
  salon() : Promise<salonIndexResponse>
}

const salonRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.send(await dashboardController.salon())
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/salon', roleCheck(['admin']), salonRoute)

export default routes
