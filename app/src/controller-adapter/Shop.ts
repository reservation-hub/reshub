import {
  Request, Response, NextFunction, Router,
} from 'express'
import { parseIntIdMiddleware } from '@routes/utils'
import {
  InsertShopQuery, UpdateShopQuery, ShopQuery, ShopListResponse, ShopListQuery, ShopResponse,
  DeleteShopQuery, InsertStylistQuery, UpdateStylistQuery, DeleteStylistQuery, ShopSearchQuery,
  InsertMenuQuery, UpdateMenuQuery, DeleteMenuQuery, ReservationListQuery, ReservationListResponse,
  InsertShopReservationQuery, UpdateShopReservationQuery, DeleteShopReservationQuery, StylistListQuery,
  StylistListResponse, StylistQuery, StylistResponse, MenuListQuery, MenuListResponse, MenuQuery,
  MenuResponse, ReservationResponse, ReservationQuery, ReservationListForCalendarQuery, ReviewListQuery,
  ReviewListResponse, ReviewQuery, ReviewResponse, TagListQuery, TagListResponse, TagLinkQuery, TagLinkResponse,
} from '@request-response-types/Shop'
import { UserForAuth } from '@entities/User'
import ShopController from '@shop/ShopController'
import MenuController from '@menu/MenuController'
import StylistController from '@stylist/StylistController'
import ReservationController from '@reservation/ReservationController'
import ReviewController from '@review/ReviewController'
import TagController from '@tag/TagController'
import parseToInt from '@lib/ParseInt'

export type ShopControllerInterface = {
  index(user: UserForAuth | undefined, query: ShopListQuery): Promise<ShopListResponse>
  show(user: UserForAuth | undefined, query: ShopQuery): Promise<ShopResponse>
  insert(user: UserForAuth | undefined, query: InsertShopQuery): Promise<ShopResponse>
  update(user: UserForAuth | undefined, query: UpdateShopQuery): Promise<ShopResponse>
  delete(user: UserForAuth | undefined, query: DeleteShopQuery): Promise<ShopResponse>
  searchShops(user: UserForAuth | undefined, query: ShopSearchQuery): Promise<ShopListResponse>
}

export type MenuControllerInterface = {
  index(user: UserForAuth | undefined, query: MenuListQuery): Promise<MenuListResponse>
  show(user: UserForAuth | undefined, query: MenuQuery): Promise<MenuResponse>
  insert(user: UserForAuth | undefined, query: InsertMenuQuery): Promise<MenuResponse>
  update(user: UserForAuth | undefined, query: UpdateMenuQuery): Promise<MenuResponse>
  delete(user: UserForAuth | undefined, query: DeleteMenuQuery): Promise<MenuResponse>
}

export type StylistControllerInterface = {
  index(user: UserForAuth | undefined, query: StylistListQuery): Promise<StylistListResponse>
  show(user: UserForAuth | undefined, query: StylistQuery): Promise<StylistResponse>
  insert(user: UserForAuth | undefined, query: InsertStylistQuery): Promise<StylistResponse>
  update(user: UserForAuth | undefined, query: UpdateStylistQuery): Promise<StylistResponse>
  delete(user: UserForAuth | undefined, query: DeleteStylistQuery): Promise<StylistResponse>
}

export type ReservationControllerInterface = {
  index(user: UserForAuth | undefined, query: ReservationListQuery): Promise<ReservationListResponse>
  indexForCalendar(user: UserForAuth | undefined, query: ReservationListForCalendarQuery)
    : Promise<ReservationListResponse>
  show(user: UserForAuth | undefined, query: ReservationQuery): Promise<ReservationResponse>
  insert(user: UserForAuth | undefined, query: InsertShopReservationQuery): Promise<ReservationResponse>
  update(user: UserForAuth | undefined, query: UpdateShopReservationQuery): Promise<ReservationResponse>
  delete(user: UserForAuth | undefined, query: DeleteShopReservationQuery): Promise<ReservationResponse>
}

export type ReviewControllerInterface = {
  index(user: UserForAuth | undefined, query: ReviewListQuery): Promise<ReviewListResponse>
  show(user: UserForAuth | undefined, query: ReviewQuery): Promise<ReviewResponse>
}

export type TagControllerInterface = {
  getShopTags(user: UserForAuth | undefined, query: TagListQuery): Promise<TagListResponse>
  linkTagsToShop(user: UserForAuth | undefined, query: TagLinkQuery): Promise<TagLinkResponse>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order, take } = req.query
    const { user } = req
    return res.send(await ShopController.index(user, { page: parseToInt(page), order, take: parseToInt(take) }))
  } catch (e) { return next(e) }
}

const showShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    const { user } = req
    return res.send(await ShopController.show(user, { id }))
  } catch (e) { return next(e) }
}

const insertShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    const { user } = req
    return res.send(await ShopController.insert(user, body))
  } catch (e) { return next(e) }
}

const updateShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { user } = req
    const { id } = res.locals
    return res.send(await ShopController.update(user, { id, params }))
  } catch (e) { return next(e) }
}

const deleteShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { id } = res.locals
    return res.send(await ShopController.delete(user, { id }))
  } catch (e) { return next(e) }
}

const showStylists = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order, take } = req.query
    const { shopId } = res.locals
    const { user } = req
    return res.send(await StylistController.index(user, {
      shopId, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const showStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const { user } = req
    return res.send(await StylistController.show(user, { shopId, stylistId }))
  } catch (e) { return next(e) }
}

const insertStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { body: params } = req
    const { user } = req
    return res.send(await StylistController.insert(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const { body: params } = req
    const { user } = req
    return res.send(await StylistController.update(user, { shopId, stylistId, params }))
  } catch (e) { return next(e) }
}

const deleteStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const { user } = req
    return res.send(await StylistController.delete(user, { shopId, stylistId }))
  } catch (e) { return next(e) }
}

const searchShops = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const {
      keyword, page, order, take,
    } = req.query
    const { user } = req
    return res.send(await ShopController.searchShops(user, {
      keyword, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const showMenus = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order, take } = req.query
    const { shopId } = res.locals
    const { user } = req
    return res.send(await MenuController.index(user, {
      shopId, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const showMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, menuId } = res.locals
    const { user } = req
    return res.send(await MenuController.show(user, { shopId, menuId }))
  } catch (e) { return next(e) }
}

const insertMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId } = res.locals
    const { user } = req
    return res.send(await MenuController.insert(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId, menuId } = res.locals
    const { user } = req
    return res.send(await MenuController.update(user, { shopId, menuId, params }))
  } catch (e) { return next(e) }
}

const deleteMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, menuId } = res.locals
    const { user } = req
    return res.send(await MenuController.delete(user, { shopId, menuId }))
  } catch (e) { return next(e) }
}

const showReservations = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order, take } = req.query
    const { shopId } = res.locals
    const { user } = req
    return res.send(await ReservationController.index(user, {
      shopId, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const showReservationsForCalendar = async (req: Request, res: Response, next: NextFunction)
 : Promise<Response | void> => {
  try {
    const { year, month } = req.query
    const { shopId } = res.locals
    const { user } = req
    return res.send(await ReservationController.indexForCalendar(user,
      { shopId, year: parseInt(year, 10), month: parseInt(month, 10) }))
  } catch (e) { return next(e) }
}

const showReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, reservationId } = res.locals
    const { user } = req
    return res.send(await ReservationController.show(user, { shopId, reservationId }))
  } catch (e) { return next(e) }
}

const insertReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId } = res.locals
    const { user } = req
    return res.send(await ReservationController.insert(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId, reservationId } = res.locals
    const { user } = req
    return res.send(await ReservationController.update(user, { shopId, reservationId, params }))
  } catch (e) { return next(e) }
}

const deleteReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, reservationId } = res.locals
    const { user } = req
    return res.send(await ReservationController.delete(user, { shopId, reservationId }))
  } catch (e) { return next(e) }
}

const showReviews = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { page, order, take } = req.query
    const { user } = req
    return res.send(await ReviewController.index(user,
      {
        shopId,
        page: parseToInt(page),
        order,
        take: parseToInt(take),
      }))
  } catch (e) { return next(e) }
}

const showReview = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, reviewId } = res.locals
    const { user } = req
    return res.send(await ReviewController.show(user, { shopId, reviewId }))
  } catch (e) { return next(e) }
}

const showTags = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { page, order, take } = req.query
    const { user } = req
    return res.send(await TagController.getShopTags(user, {
      shopId,
      page: parseToInt(page),
      order,
      take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const linkTags = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { user, body: params } = req
    return res.send(await TagController.linkTagsToShop(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const routes = Router()

// shop routes
routes.get('/', index)
routes.get('/search', searchShops)
routes.get('/:id', parseIntIdMiddleware, showShop)
routes.post('/', insertShop)
routes.patch('/:id', parseIntIdMiddleware, updateShop)
routes.delete('/:id', parseIntIdMiddleware, deleteShop)

// stylist routes
routes.get('/:shopId/stylist', parseIntIdMiddleware, showStylists)
routes.get('/:shopId/stylist/:stylistId', parseIntIdMiddleware, showStylist)
routes.post('/:shopId/stylist', parseIntIdMiddleware, insertStylist)
routes.patch('/:shopId/stylist/:stylistId', parseIntIdMiddleware, updateStylist)
routes.delete('/:shopId/stylist/:stylistId', parseIntIdMiddleware, deleteStylist)

// menu routes
routes.get('/:shopId/menu', parseIntIdMiddleware, showMenus)
routes.get('/:shopId/menu/:menuId', parseIntIdMiddleware, showMenu)
routes.post('/:shopId/menu', parseIntIdMiddleware, insertMenu)
routes.patch('/:shopId/menu/:menuId', parseIntIdMiddleware, updateMenu)
routes.delete('/:shopId/menu/:menuId', parseIntIdMiddleware, deleteMenu)

// reservation routes
routes.get('/:shopId/reservation', parseIntIdMiddleware, showReservations)
routes.get('/:shopId/reservation/calendar', parseIntIdMiddleware, showReservationsForCalendar)
routes.get('/:shopId/reservation/:reservationId', parseIntIdMiddleware, showReservation)
routes.post('/:shopId/reservation', parseIntIdMiddleware, insertReservation)
routes.patch('/:shopId/reservation/:reservationId', parseIntIdMiddleware, updateReservation)
routes.delete('/:shopId/reservation/:reservationId', parseIntIdMiddleware, deleteReservation)

// review routes
routes.get('/:shopId/reviews', parseIntIdMiddleware, showReviews)
routes.get('/:shopId/reviews/:reviewId', parseIntIdMiddleware, showReview)

// tag routes
routes.get('/:shopId/tags', parseIntIdMiddleware, showTags)
routes.post('/:shopId/tags', parseIntIdMiddleware, linkTags)

export default routes
