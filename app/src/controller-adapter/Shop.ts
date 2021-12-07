import {
  Request, Response, NextFunction, Router,
} from 'express'
import ShopController from '@controllers/shopController'
import { parseIntIdMiddleware, roleCheck } from '@routes/utils'
import {
  deleteShopQuery,
  deleteStylistQuery,
  insertShopQuery,
  insertStylistQuery,
  shopQuery,
  shopResponse,
  shopSearchQuery,
  shopSearchResponse,
  shopsResponse,
  shopsWithCountQuery, stylistResponse, updateShopQuery, updateStylistQuery,
} from '@request-response-types/Shop'
import { User } from '@entities/User'

export type ShopControllerInterface = {
  index(query: shopsWithCountQuery) : Promise<shopsResponse>
  show(user: User, query: shopQuery) : Promise<shopResponse>
  insert(user: User, query: insertShopQuery) : Promise<shopResponse>
  update(user: User, query: updateShopQuery) : Promise<shopResponse>
  delete(user: User, query: deleteShopQuery) : Promise<{ message: string }>
  insertStylist(user: User, query: insertStylistQuery) : Promise<stylistResponse>
  updateStylist(user: User, query: updateStylistQuery) : Promise<stylistResponse>
  deleteStylist(user: User, query: deleteStylistQuery) : Promise<stylistResponse>
  searchShops(query: shopSearchQuery): Promise<shopSearchResponse>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    return res.send(await ShopController.index({ page, order }))
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

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin', 'shop_staff']), parseIntIdMiddleware, showShop)
routes.post('/', roleCheck(['admin', 'shop_staff']), insertShop)
routes.post('/search', searchShops)
routes.patch('/:id', roleCheck(['admin', 'shop_staff']), parseIntIdMiddleware, updateShop)
routes.delete('/:id', roleCheck(['admin', 'shop_staff']), parseIntIdMiddleware, deleteShop)
routes.post('/:shopId/stylist', roleCheck(['admin']), parseIntIdMiddleware, insertStylist)
routes.patch('/:shopId/stylist/:id', roleCheck(['admin']), parseIntIdMiddleware, updateStylist)
routes.delete('/:shopId/stylist/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteStylist)

export default routes
