import {
  Request, Response, NextFunction, Router,
} from 'express'
import {
  SalonListQuery, SalonListResponse, SalonQuery, SalonResponse,
  SalonMenuListQuery, SalonMenuListResponse, SalonStylistListQuery, SalonStylistListResponse,
  SalonAvailabilityQuery, SalonAvailabilityResponse, SalonSetReservationQuery,
} from '@request-response-types/client/Shop'
import { UserForAuth } from '@entities/User'
import { parseIntIdMiddleware, protectClientRoute } from '@routes/utils'
import ShopController from '@client/shop/ShopController'
import MenuController from '@client/menu/MenuController'
import StylistController from '@client/stylist/StylistController'
import ReservationController from '@client/reservation/ReservationController'
import { ResponseMessage } from '@request-response-types/client/Common'

export type ShopControllerInterface = {
  index(user: UserForAuth | undefined, query: SalonListQuery): Promise<SalonListResponse>
  detail(user: UserForAuth | undefined, query: SalonQuery): Promise<SalonResponse>
}

export type MenuControllerInterface = {
  list(user: UserForAuth | undefined, query: SalonMenuListQuery): Promise<SalonMenuListResponse>
}

export type StylistControllerInterface = {
  list(user: UserForAuth | undefined, query: SalonStylistListQuery): Promise<SalonStylistListResponse>
}

export type ReservationControllerInterface = {
  list(user: UserForAuth | undefined, query: SalonAvailabilityQuery): Promise<SalonAvailabilityResponse>
  create(user: UserForAuth | undefined, query: SalonSetReservationQuery): Promise<ResponseMessage>
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
    const { user } = req
    return res.send(await ShopController.detail(user, { shopId }))
  } catch (e) { return next(e) }
}

const shopMenus = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { page, order } = req.query
    return res.send(await MenuController.list(user, { shopId, page, order }))
  } catch (e) { return next(e) }
}

const shopStylists = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { page, order } = req.query
    return res.send(await StylistController.list(user, { shopId, page, order }))
  } catch (e) { return next(e) }
}

const shopReservations = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { body: params } = req
    return res.send(await ReservationController.list(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const createReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { body: params } = req
    return res.send(await ReservationController.create(user, { shopId, params }))
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

/**
 * stylist routes
 */

routes.get('/:shopId/reservations', parseIntIdMiddleware, shopReservations)
routes.post('/:shopId/reservations', parseIntIdMiddleware, protectClientRoute, createReservation)

export default routes
