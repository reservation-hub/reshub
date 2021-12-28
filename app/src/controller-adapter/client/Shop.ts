import {
  Request, Response, NextFunction, Router,
} from 'express'
import { SalonListQuery, SalonListResponse } from '@request-response-types/client/Shop'
import ShopController from '@client/shop/ShopController'
import { UserForAuth } from '@entities/User'

export type ShopControllerInterface = {
  index(user: UserForAuth, query: SalonListQuery): Promise<SalonListResponse>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    const user = req.user as UserForAuth
    return res.send(await ShopController.index(user, { page, order }))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', index)

export default routes
