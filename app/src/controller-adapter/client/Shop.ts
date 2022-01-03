import {
  Request, Response, NextFunction, Router,
} from 'express'
import {
  SalonListQuery, SalonListResponse, SalonQuery, SalonResponse,
  SalonMenuListQuery, SalonMenuListResponse, SalonStylistListQuery, SalonStylistListResponse,
} from '@request-response-types/client/Shop'
import { UserForAuth } from '@entities/User'
import { parseIntIdMiddleware } from '@routes/utils'
import ShopController from '@client/shop/ShopController'
import MenuController from '@client/menu/MenuController'
import StylistController from '@client/stylist/StylistController'

export type ShopControllerInterface = {
  index(user: UserForAuth, query: SalonListQuery): Promise<SalonListResponse>
  detail(user: UserForAuth, query: SalonQuery): Promise<SalonResponse>
}

export type MenuControllerInterface = {
  list(user: UserForAuth, query: SalonMenuListQuery): Promise<SalonMenuListResponse>
}

export type StylistControllerInterface = {
  list(user: UserForAuth, query: SalonStylistListQuery): Promise<SalonStylistListResponse>
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

const shopMenus = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const user = req.user as UserForAuth
    const { shopId } = res.locals
    const { page, order } = req.query
    return res.send(await MenuController.list(user, { shopId, page, order }))
  } catch (e) { return next(e) }
}

const shopStylists = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const user = req.user as UserForAuth
    const { shopId } = res.locals
    const { page, order } = req.query
    return res.send(await StylistController.list(user, { shopId, page, order }))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', index)
routes.get('/:shopId', parseIntIdMiddleware, detail)

/**
 * Menu routes
 */

routes.get('/:shopId/menus', parseIntIdMiddleware, shopMenus)

/**
 * Stylist routes
 */

routes.get('/:shopId/stylists', parseIntIdMiddleware, shopStylists)

export default routes
