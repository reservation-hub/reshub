import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { shopScheduleSchema, shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import ShopService, {
  insertShopQuery, updateShopQuery, upsertScheduleQuery, upsertStylistQuery,
} from '../services/ShopService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { Shop, ShopSchedule } from '../entities/Shop'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import { shopStylistUpsertSchema } from './schemas/stylist'
import { Stylist } from '../entities/Stylist'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<{ data: Shop[], totalCount: number }>,
  fetchShop(id: number): Promise<Shop>,
  insertShop(query: insertShopQuery): Promise<Shop>,
  updateShop(id: number, query: updateShopQuery): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  upsertSchedule(shopId: number, query: upsertScheduleQuery)
    : Promise<ShopSchedule>
  insertStylist(shopId: number, query: upsertStylistQuery)
    : Promise<Stylist>
  updateStylist(shopId: number, stylistId: number, query: upsertStylistQuery)
    : Promise<Stylist>
  deleteStylist(shopId: number, stylistId: number)
    : Promise<Stylist>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
  const shopsWithCount = await ShopService.fetchShopsWithTotalCount(schemaValues)
  const { data: shops, totalCount } = shopsWithCount

  const shopIds = shops.map(shop => shop.id)

  const totalReservationsCount = await ShopService.fetchReservationsCountByShopIds(shopIds)
  const totalStylistsCount = await ShopService.fetchStylistsCountByShopIds(shopIds)

  // merge data
  const data = shops.map(shop => ({
    ...shop,
    reservationsCount: totalReservationsCount.find(item => item.id === shop.id)?.count,
    stylistsCount: totalStylistsCount.find(item => item.id === shop.id)?.count,
  }))

  return res.send({ data, totalCount })
})

const showShop = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const shop = await ShopService.fetchShop(id)
  return res.send(shop)
})

const insertShop = asyncHandler(async (req, res) => {
  const shopInsertValues = await shopUpsertSchema.validateAsync(req.body, joiOptions)

  const shop = await ShopService.insertShop(shopInsertValues)
  return res.send(shop)
})

const updateShop = asyncHandler(async (req, res) => {
  const shopUpdateValues = await shopUpsertSchema.validateAsync(req.body, joiOptions)
  const { id } = res.locals

  const shop = await ShopService.updateShop(id, shopUpdateValues)

  return res.send(shop)
})

const deleteShop = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await ShopService.deleteShop(id)
  return res.send({ message: 'Shop deleted' })
})

const insertBusinessDaysAndHours = asyncHandler(async (req, res) => {
  const schemaValues = await shopScheduleSchema.validateAsync(req.body, joiOptions)
  const { shopId } = res.locals
  const schedule = await ShopService.upsertSchedule(shopId, schemaValues)
  return res.send(schedule)
})

const insertStylist = asyncHandler(async (req, res) => {
  const schemaValues = await shopStylistUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId } = res.locals
  const stylist = await ShopService.insertStylist(shopId, schemaValues)
  return res.send(stylist)
})

const updateStylist = asyncHandler(async (req, res) => {
  const schemaValues = await shopStylistUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId, id } = res.locals
  const stylist = await ShopService.updateStylist(shopId, id, schemaValues)
  return res.send(stylist)
})

const deleteStylist = asyncHandler(async (req, res) => {
  const { shopId, id } = res.locals
  const stylist = await ShopService.deleteStylist(shopId, id)
  return res.send(stylist)
})

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showShop)
routes.post('/', roleCheck(['admin']), insertShop)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateShop)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteShop)
routes.post('/:shopId/schedule', roleCheck(['admin']), parseIntIdMiddleware, insertBusinessDaysAndHours)
routes.post('/:shopId/stylist', roleCheck(['admin']), parseIntIdMiddleware, insertStylist)
routes.patch('/:shopId/stylist/:id', roleCheck(['admin']), parseIntIdMiddleware, updateStylist)
routes.delete('/:shopId/stylist/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteStylist)

export default routes
