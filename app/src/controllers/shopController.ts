import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import ShopService from '@services/ShopService'
import {
  fetchModelsWithTotalCountQuery,
  fetchModelsWithTotalCountResponse,
} from '@request-response-types/ServiceCommonTypes'
import { ShopControllerInterface } from '@controller-adapter/Shop'
import { User } from '@entities/User'
import { MenuItem } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import { shopStylistUpsertSchema } from './schemas/stylist'
import { searchSchema } from './schemas/search'
import { menuItemUpsertSchema } from './schemas/menu'
import { reservationUpsertSchema } from './schemas/reservation'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: User, query: fetchModelsWithTotalCountQuery)
    : Promise<fetchModelsWithTotalCountResponse<Shop>>,
  fetchShop(user: User, id: number): Promise<Shop>,
  insertShop(user: User, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: number[],
    startTime: string, endTime: string, details: string): Promise<Shop>,
  updateShop(user: User, id: number, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: number[],
    startTime: string, endTime: string, details: string): Promise<Shop>,
  deleteShop(user: User, id: number): Promise<Shop>,
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  insertStylist(user: User, shopId: number, name: string, price: number,
    days:number[], startTime:string, endTime:string)
    : Promise<Stylist>
  updateStylist(user: User, shopId: number, stylistId: number, name: string, price: number,
    days: number[], startTime: string, endTime: string)
    : Promise<Stylist>
  deleteStylist(user: User, shopId: number, stylistId: number)
    : Promise<Stylist>
  searchShops(keyword: string): Promise<Shop[]>
  insertMenuItem(user: User, shopId: number, name: string, description: string, price: number)
    : Promise<MenuItem>,
  updateMenuItem(user: User, shopId: number, menuItemId: number, name: string,
    description: string, price: number): Promise<MenuItem>
  deleteMenuItem(user: User, shopId: number, menuItemId: number): Promise<MenuItem>
  fetchShopReservations(user: User, shopId: number): Promise<Reservation[]>
  insertReservation(user: User, shopId: number, reservationDate: Date, clientId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(user: User, shopId: number, reservationId: number,
    reservationDate: Date, clientId: number, stylistId?: number)
    : Promise<Reservation>
  cancelReservation(user: User, shopId: number, reservationId: number): Promise<Reservation>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ShopController: ShopControllerInterface = {
  async index(user, query) {
    const params = await indexSchema.validateAsync(query, joiOptions)
    const shopsWithCount = await ShopService.fetchShopsWithTotalCount(user, params)
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

  async show(user, query) {
    const { id } = query
    return ShopService.fetchShop(user, id)
  },

  async insert(user, query) {
    const {
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query, joiOptions)
    return ShopService.insertShop(user,
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details)
  },

  async update(user, query) {
    const {
      name, areaId, prefectureId, cityId, address, phoneNumber,
      days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query.params, joiOptions)
    const { id } = query

    return ShopService.updateShop(user, id, name, areaId, prefectureId, cityId,
      address, phoneNumber, days, startTime, endTime, details)
  },

  async delete(user, query) {
    const { id } = query
    await ShopService.deleteShop(user, id)
    return { message: 'Shop deleted' }
  },

  async insertStylist(user, query) {
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    return ShopService.insertStylist(user, shopId, name, price, days, startTime, endTime)
  },

  async updateStylist(user, query) {
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, stylistId } = query
    return ShopService.updateStylist(user, shopId, stylistId, name, price, days, startTime, endTime)
  },

  async deleteStylist(user, query) {
    const { shopId, stylistId } = query
    await ShopService.deleteStylist(user, shopId, stylistId)
    return { message: 'stylist deleted' }
  },

  async searchShops(query) {
    const searchValues = await searchSchema.validateAsync(query, joiOptions)
    const shops = await ShopService.searchShops(searchValues.keyword)
    return shops
  },

  async insertMenuItem(user, query) {
    const { name, description, price } = await menuItemUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    return ShopService.insertMenuItem(user, shopId, name, description, price)
  },

  async updateMenuItem(user, query) {
    const { name, description, price } = await menuItemUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, menuItemId } = query
    return ShopService.updateMenuItem(user, shopId, menuItemId, name, description, price)
  },

  async deleteMenuItem(user, query) {
    const { shopId, menuItemId } = query
    await ShopService.deleteMenuItem(user, shopId, menuItemId)
    return { message: 'menu item deleted' }
  },

  async showReservations(user, query) {
    const { shopId } = query
    return ShopService.fetchShopReservations(user, shopId)
  },

  async insertReservation(user, query) {
    const { reservationDate, userId, stylistId } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    return ShopService.insertReservation(user, shopId, reservationDate, userId, stylistId)
  },

  async updateReservation(user, query) {
    const { reservationDate, userId, stylistId } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, reservationId } = query
    return ShopService.updateReservation(user, shopId, reservationId, reservationDate, userId, stylistId)
  },

  async deleteReservation(user, query) {
    const { shopId, reservationId } = query
    await ShopService.cancelReservation(user, shopId, reservationId)
    return { message: 'Reservation deleted' }
  },
}

export default ShopController
