import {
  Request, Response, NextFunction, Router,
} from 'express'
import ShopController from '@controllers/shopController'
import { parseIntIdMiddleware } from '@routes/utils'
import {
  deleteMenuItemQuery, deleteShopQuery, deleteShopReservationQuery, deleteStylistQuery,
  insertMenuItemQuery, insertShopQuery, insertShopReservationQuery, insertStylistQuery,
  menuResponse, reservationResponse, shopQuery, shopResponse, shopSearchQuery, shopSearchResponse,
  shopsResponse, shopsWithCountQuery, showShopReservationsQuery, showShopReservationsResponse,
  stylistResponse, updateMenuItemQuery, updateShopQuery, updateShopReservationQuery, updateStylistQuery,
} from '@request-response-types/Shop'
import { User } from '@entities/User'

export type ShopControllerInterface = {
  index(user: User, query: shopsWithCountQuery) : Promise<shopsResponse>
  show(user: User, query: shopQuery) : Promise<shopResponse>
  insert(user: User, query: insertShopQuery) : Promise<shopResponse>
  update(user: User, query: updateShopQuery) : Promise<shopResponse>
  delete(user: User, query: deleteShopQuery) : Promise<{ message: string }>
  insertStylist(user: User, query: insertStylistQuery) : Promise<stylistResponse>
  updateStylist(user: User, query: updateStylistQuery) : Promise<stylistResponse>
  deleteStylist(user: User, query: deleteStylistQuery) : Promise<{ message: string }>
  searchShops(query: shopSearchQuery): Promise<shopSearchResponse>
  insertMenuItem(user: User, query: insertMenuItemQuery): Promise<menuResponse>
  updateMenuItem(user: User, query: updateMenuItemQuery): Promise<menuResponse>
  deleteMenuItem(user: User, query: deleteMenuItemQuery): Promise<{ message: string }>
  showReservations(user: User, query: showShopReservationsQuery): Promise<showShopReservationsResponse>
  insertReservation(user: User, query: insertShopReservationQuery): Promise<reservationResponse>
  updateReservation(user: User, query: updateShopReservationQuery): Promise<reservationResponse>
  deleteReservation(user: User, query: deleteShopReservationQuery): Promise<{ message: string }>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    const user = req.user as User
    return res.send(await ShopController.index(user, { page, order }))
  } catch (e) { return next(e) }
}

const showShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    const user = req.user as User
    return res.send(await ShopController.show(user, { id }))
  } catch (e) { return next(e) }
}

const insertShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    const user = req.user as User
    return res.send(await ShopController.insert(user, body))
  } catch (e) { return next(e) }
}

const updateShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const user = req.user as User
    const { id } = res.locals
    return res.send(await ShopController.update(user, { id, params }))
  } catch (e) { return next(e) }
}

const deleteShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const user = req.user as User
    const { id } = res.locals
    return res.send(await ShopController.delete(user, { id }))
  } catch (e) { return next(e) }
}

const insertStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { body: params } = req
    const user = req.user as User
    return res.send(await ShopController.insertStylist(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const { body: params } = req
    const user = req.user as User
    return res.send(await ShopController.updateStylist(user, { shopId, stylistId, params }))
  } catch (e) { return next(e) }
}

const deleteStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.deleteStylist(user, { shopId, stylistId }))
  } catch (e) { return next(e) }
}

const searchShops = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await ShopController.searchShops(body))
  } catch (e) { return next(e) }
}

const insertMenuItem = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.insertMenuItem(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateMenuItem = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId, menuItemId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.updateMenuItem(user, { shopId, menuItemId, params }))
  } catch (e) { return next(e) }
}

const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, menuItemId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.deleteMenuItem(user, { shopId, menuItemId }))
  } catch (e) { return next(e) }
}

const showReservations = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.showReservations(user, { shopId }))
  } catch (e) { return next(e) }
}

const insertReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.insertReservation(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId, reservationId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.updateReservation(user, { shopId, reservationId, params }))
  } catch (e) { return next(e) }
}

const deleteReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, reservationId } = res.locals
    const user = req.user as User
    return res.send(await ShopController.deleteReservation(user, { shopId, reservationId }))
  } catch (e) { return next(e) }
}

const routes = Router()

// shop routes
routes.get('/', index)
routes.get('/:id', parseIntIdMiddleware, showShop)
routes.post('/', insertShop)
routes.patch('/:id', parseIntIdMiddleware, updateShop)
routes.delete('/:id', parseIntIdMiddleware, deleteShop)
routes.post('/search', searchShops)

// stylist routes
routes.post('/:shopId/stylist', parseIntIdMiddleware, insertStylist)
routes.patch('/:shopId/stylist/:stylistId', parseIntIdMiddleware, updateStylist)
routes.delete('/:shopId/stylist/:stylistId', parseIntIdMiddleware, deleteStylist)

// menu routes
routes.post('/:shopId/menu', parseIntIdMiddleware, insertMenuItem)
routes.patch('/:shopId/menu/:menuItemId', parseIntIdMiddleware, updateMenuItem)
routes.delete('/:shopId/menu/:menuItemId', parseIntIdMiddleware, deleteMenuItem)

// reservation routes
routes.get('/:shopId/reservation', parseIntIdMiddleware, showReservations)
routes.post('/:shopId/reservation', parseIntIdMiddleware, insertReservation)
routes.patch('/:shopId/reservation/:reservationId', parseIntIdMiddleware, updateReservation)
routes.delete('/:shopId/reservation/:reservationId', parseIntIdMiddleware, deleteReservation)

export default routes
