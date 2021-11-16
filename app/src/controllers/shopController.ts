import {
  Request, Response, NextFunction,
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
import { shopStylistUpsertSchema } from './schemas/stylist'
import { Stylist } from '../entities/Stylist'
import { fetchModelsWithTotalCountResponse } from '../request-response-types/ServiceCommonTypes'
import { searchSchema } from './schemas/search'
import { ShopControllerInterface } from '../controller-adapter/Shop'

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
  searchShops(keyword: string): Promise<Shop[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ShopController: ShopControllerInterface = {
  async index(query) {
    const params = await indexSchema.validateAsync(query, joiOptions)
    const shopsWithCount = await ShopService.fetchShopsWithTotalCount(params)
    const { values: shops, totalCount } = shopsWithCount

    const shopIds = shops.map(shop => shop.id)

    const totalReservationsCount = await ShopService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await ShopService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values = shops.map(shop => ({
      ...shop,
      reservationsCount: totalReservationsCount.find(item => item.id === shop.id)!.count,
      stylistsCount: totalStylistsCount.find(item => item.id === shop.id)!.count,
    }))

    return { values, totalCount }
  },

  async show(query) {
    const { id } = query
    const shop = await ShopService.fetchShop(id)
    return shop
  },

  async insert(query) {
    const shopInsertValues = await shopUpsertSchema.validateAsync(query, joiOptions)
    const shop = await ShopService.insertShop(shopInsertValues)
    return shop
  },

  async update(query) {
    const params = await shopUpsertSchema.validateAsync(query.params, joiOptions)
    const { id } = query

    const shop = await ShopService.updateShop({ id, params })

    return shop
  },

  async delete(query) {
    const { id } = query
    await ShopService.deleteShop(id)
    return { message: 'Shop deleted' }
  },

  async insertStylist(query) {
    const params = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    const stylist = await ShopService.insertStylist({ shopId, params })
    return stylist
  },

  async updateStylist(query) {
    const params = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, stylistId } = query
    const stylist = await ShopService.updateStylist({ shopId, stylistId, params })
    return stylist
  },

  async deleteStylist(query) {
    const { shopId, stylistId } = query
    const stylist = await ShopService.deleteStylist({ shopId, stylistId })
    return stylist
  },

  async searchShops(query) {
    const searchValues = await searchSchema.validateAsync(query, joiOptions)
    const shops = await ShopService.searchShops(searchValues.keyword)
    return shops
  },
}

export default ShopController

export const searchShops = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
    const shop = await ShopService.searchShops(searchValues.keyword)
    return res.send({ data: shop })
  } catch (e) { return next(e) }
}
