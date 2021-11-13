import {
  Router, Request, Response, NextFunction,
} from 'express'
import { shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import ShopService from '../services/ShopService'
import {
  insertShopQuery,
  updateShopQuery,
  insertStylistQuery,
  updateStylistQuery,
  deleteStylistQuery,
} from '../request-response-types/ShopService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { Shop } from '../entities/Shop'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import { shopStylistUpsertSchema } from './schemas/stylist'
import { Stylist } from '../entities/Stylist'
import { fetchModelsWithTotalCountResponse } from '../request-response-types/ServiceCommonTypes'
import { ShopDetail } from '.prisma/client'
import { searchSchema } from './schemas/search'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<fetchModelsWithTotalCountResponse<Shop>>,
  fetchShop(id: number): Promise<Shop>,
  insertShop(query: insertShopQuery): Promise<Shop>,
  updateShop(query: updateShopQuery): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  insertStylist(query: insertStylistQuery)
    : Promise<Stylist>
  updateStylist(query: updateStylistQuery)
    : Promise<Stylist>
  deleteStylist(query: deleteStylistQuery)
    : Promise<Stylist>
  searchShops(keyword: string): Promise<ShopDetail[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await indexSchema.validateAsync(req.query, joiOptions)
    const shopsWithCount = await ShopService.fetchShopsWithTotalCount(params)
    const { values: shops, totalCount } = shopsWithCount

    const shopIds = shops.map(shop => shop.id)

    const totalReservationsCount = await ShopService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await ShopService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values: Shop[] = shops.map(shop => ({
      ...shop,
      reservationsCount: totalReservationsCount.find(item => item.id === shop.id)?.count,
      stylistsCount: totalStylistsCount.find(item => item.id === shop.id)?.count,
    }))

    return res.send({ values, totalCount })
  } catch (e) { return next(e) }
}

const showShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    const shop = await ShopService.fetchShop(id)
    return res.send(shop)
  } catch (e) { return next(e) }
}

export const searchShops = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
    const shop = await ShopService.searchShops(searchValues.keyword)
    return res.send({ data: shop })
  } catch (e) { return next(e) }
}

const insertShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const shopInsertValues = await shopUpsertSchema.validateAsync(req.body, joiOptions)

    const shop = await ShopService.insertShop(shopInsertValues)
    return res.send(shop)
  } catch (e) { return next(e) }
}

const updateShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await shopUpsertSchema.validateAsync(req.body, joiOptions)
    const { id } = res.locals

    const shop = await ShopService.updateShop({ id, params })

    return res.send(shop)
  } catch (e) { return next(e) }
}

const deleteShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    await ShopService.deleteShop(id)
    return res.send({ message: 'Shop deleted' })
  } catch (e) { return next(e) }
}

const insertStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await shopStylistUpsertSchema.validateAsync(req.body, joiOptions)
    const { shopId } = res.locals
    const stylist = await ShopService.insertStylist({ shopId, params })
    return res.send(stylist)
  } catch (e) { return next(e) }
}

const updateStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await shopStylistUpsertSchema.validateAsync(req.body, joiOptions)
    const { shopId, id } = res.locals
    const stylist = await ShopService.updateStylist({ shopId, stylistId: id, params })
    return res.send(stylist)
  } catch (e) { return next(e) }
}

const deleteStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, id } = res.locals
    const stylist = await ShopService.deleteStylist({ shopId, stylistId: id })
    return res.send(stylist)
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
