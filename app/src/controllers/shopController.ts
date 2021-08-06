import asyncHandler from 'express-async-handler'
import { shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import ShopService, { insertShopQuery, updateShopQuery } from '../services/ShopService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { Shop } from '../entities/Shop'

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
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = asyncHandler(async (req, res) => {
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

export const showShop = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const shop = await ShopService.fetchShop(id)
  return res.send(shop)
})

export const insertShop = asyncHandler(async (req, res) => {
  const shopInsertValues = await shopUpsertSchema.validateAsync(req.body, joiOptions)

  const shop = await ShopService.insertShop(shopInsertValues)
  return res.send(shop)
})

export const updateShop = asyncHandler(async (req, res) => {
  const shopUpdateValues = await shopUpsertSchema.validateAsync(req.body, joiOptions)
  const { id } = res.locals

  const shop = await ShopService.updateShop(id, shopUpdateValues)

  return res.send(shop)
})

export const deleteShop = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await ShopService.deleteShop(id)
  return res.send({ message: 'Shop deleted' })
})
