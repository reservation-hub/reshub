import {
  Request, Response, NextFunction, Router,
} from 'express'
import {
  SalonListQuery, SalonListResponse, SalonQuery, SalonResponse,
} from '@request-response-types/client/Shop'
import ShopController from '@client/shop/ShopController'
import { UserForAuth } from '@entities/User'
import { parseIntIdMiddleware } from '@/routes/utils'

export type ShopControllerInterface = {
  index(user: UserForAuth, query: SalonListQuery): Promise<SalonListResponse>
  detail(user: UserForAuth, query: SalonQuery): Promise<SalonResponse>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    const user = req.user as UserForAuth
    return res.send(await ShopController.index(user, { page, order }))
  } catch (e) { return next(e) }
}

const detail = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await ShopController.detail(user, { shopId }))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', index)
routes.get('/:shopId', parseIntIdMiddleware, detail)

export default routes
