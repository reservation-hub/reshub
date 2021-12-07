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

export type ShopControllerInterface = {
  index(query: shopsWithCountQuery) : Promise<shopsResponse>
  show(query: shopQuery) : Promise<shopResponse>
  insert(query: insertShopQuery) : Promise<shopResponse>
  update(query: updateShopQuery) : Promise<shopResponse>
  delete(query: deleteShopQuery) : Promise<{ message: string }>
  insertStylist(query: insertStylistQuery) : Promise<stylistResponse>
  updateStylist(query: updateStylistQuery) : Promise<stylistResponse>
  deleteStylist(query: deleteStylistQuery) : Promise<stylistResponse>
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
    return res.send(await ShopController.show({ id }))
  } catch (e) { return next(e) }
}

const insertShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await ShopController.insert(body))
  } catch (e) { return next(e) }
}

const updateShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { id } = res.locals
    return res.send(await ShopController.update({ id, params }))
  } catch (e) { return next(e) }
}

const deleteShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await ShopController.delete({ id }))
  } catch (e) { return next(e) }
}

const insertStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { body: params } = req
    return res.send(await ShopController.insertStylist({ shopId, params }))
  } catch (e) { return next(e) }
}

const updateStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const { body: params } = req
    return res.send(await ShopController.updateStylist({ shopId, stylistId, params }))
  } catch (e) { return next(e) }
}

const deleteStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    return res.send(await ShopController.deleteStylist({ shopId, stylistId }))
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
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showShop)
routes.post('/', roleCheck(['admin']), insertShop)
routes.post('/search', searchShops)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateShop)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteShop)
routes.post('/:shopId/stylist', roleCheck(['admin']), parseIntIdMiddleware, insertStylist)
routes.patch('/:shopId/stylist/:id', roleCheck(['admin']), parseIntIdMiddleware, updateStylist)
routes.delete('/:shopId/stylist/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteStylist)

export default routes
