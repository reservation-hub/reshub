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
  fetchShopsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<fetchModelsWithTotalCountResponse<Shop>>,
  fetchShop(id: number): Promise<Shop>,
  insertShop(name: string, areaId: number, prefectureId: number, cityId: number, address: string, phoneNumber: string,
    days: number[], startTime: string, endTime: string, details: string): Promise<Shop>,
  updateShop(id: number, name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: number[], startTime: string, endTime: string, details: string): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  insertStylist(shopId: number, name: string, price: number)
    : Promise<Stylist>
  updateStylist(shopId: number, stylistId: number, name: string, price: number)
    : Promise<Stylist>
  deleteStylist(shopId: number, stylistId: number)
    : Promise<Stylist>
  searchShops(keyword: string): Promise<Shop[]>
  fetchStaffShop(user: User, id: number): Promise<Shop>
  insertStaffShop(user: User, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string,
    days: number[], startTime: string, endTime: string, details: string): Promise<Shop>
  updateStaffShop(user: User, id: number, name: string, areaId: number, prefectureId: number, cityId: number,
    address: string, phoneNumber: string, days: number[], startTime: string, endTime: string, details: string)
    : Promise<Shop>
  deleteStaffShop(user: User, id: number): Promise<Shop>
  insertStylistByShopStaff(user: User, shopId: number, name: string, price: number): Promise<Stylist>
  updateStylistByShopStaff(user: User, shopId: number, stylistId: number, name: string, price: number): Promise<Stylist>
  deleteStylistByShopStaff(user: User, shopId: number, stylistId: number): Promise<Stylist>
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>,
  insertMenuItemByShopStaff(user: User, shopId: number, name: string, description: string, price: number)
    : Promise<MenuItem>,
  updateMenuItem(shopId: number, menuItemId: number, name: string, description: string, price: number)
    : Promise<MenuItem>
  updateMenuItemByShopStaff(user: User, shopId: number, menuItemId: number, name: string,
    description: string, price: number): Promise<MenuItem>
  deleteMenuItem(shopId: number, menuItemId: number): Promise<MenuItem>
  deleteMenuItemByShopStaff(user: User, shopId: number, menuItemId: number): Promise<MenuItem>
  fetchShopReservations(shopId: number): Promise<Reservation[]>
  fetchShopReservationsByShopStaff(user: User, shopId: number): Promise<Reservation[]>
  insertReservation(shopId: number, reservationDate: Date, userId: number, stylistId?: number)
    : Promise<Reservation>
  insertReservationByShopStaff(user: User, shopId: number, reservationDate: Date, userId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(shopId: number, reservationId: number, reservationDate: Date, userId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservationByShopStaff(user: User, shopId: number, reservationId: number,
    reservationDate: Date, userId: number, stylistId?: number)
    : Promise<Reservation>
  deleteReservation(reservationId: number): Promise<Reservation>
  deleteReservationByShopStaff(user: User, shopId: number, reservationId: number): Promise<Reservation>
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

  async show(user, query) {
    const { id } = query
    let shop
    if (user.role.slug === 'shop_staff') {
      shop = await ShopService.fetchStaffShop(user, id)
    } else {
      shop = await ShopService.fetchShop(id)
    }
    return shop
  },

  async insert(user, query) {
    const {
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query, joiOptions)
    let shop
    if (user.role.slug === 'shop_staff') {
      shop = await ShopService.insertStaffShop(user,
        name, areaId, prefectureId, cityId, address,
        phoneNumber, days, startTime, endTime, details)
    } else {
      shop = await ShopService.insertShop(
        name, areaId, prefectureId, cityId, address,
        phoneNumber, days, startTime, endTime, details,
      )
    }
    return shop
  },

  async update(user, query) {
    const {
      name, areaId, prefectureId, cityId, address, phoneNumber,
      days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query.params, joiOptions)
    const { id } = query
    let shop

    if (user.role.slug === 'shop_staff') {
      shop = await ShopService.updateStaffShop(user, id, name, areaId, prefectureId, cityId,
        address, phoneNumber, days, startTime, endTime, details)
    } else {
      shop = await ShopService.updateShop(id, name, areaId, prefectureId, cityId, address,
        phoneNumber, days, startTime, endTime, details)
    }

    return shop
  },

  async delete(user, query) {
    const { id } = query
    if (user.role.slug === 'shop_staff') {
      await ShopService.deleteStaffShop(user, id)
    } else {
      await ShopService.deleteShop(id)
    }
    return { message: 'Shop deleted' }
  },

  async insertStylist(user, query) {
    const { name, price } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    let stylist

    if (user.role.slug === 'shop_staff') {
      stylist = await ShopService.insertStylistByShopStaff(user, shopId, name, price)
    } else {
      stylist = await ShopService.insertStylist(shopId, name, price)
    }

    return stylist
  },

  async updateStylist(user, query) {
    const { name, price } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, stylistId } = query
    let stylist
    if (user.role.slug === 'shop_staff') {
      stylist = await ShopService.updateStylistByShopStaff(user, shopId, stylistId, name, price)
    } else {
      stylist = await ShopService.updateStylist(shopId, stylistId, name, price)
    }
    return stylist
  },

  async deleteStylist(user, query) {
    const { shopId, stylistId } = query
    if (user.role.slug === 'shop_staff') {
      await ShopService.deleteStylistByShopStaff(user, shopId, stylistId)
    } else {
      await ShopService.deleteStylist(shopId, stylistId)
    }
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
    let menuItem
    if (user.role.slug === 'shop_staff') {
      menuItem = await ShopService.insertMenuItemByShopStaff(user, shopId, name, description, price)
    } else {
      menuItem = await ShopService.insertMenuItem(shopId, name, description, price)
    }
    return menuItem
  },

  async updateMenuItem(user, query) {
    const { name, description, price } = await menuItemUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, menuItemId } = query
    let menuItem
    if (user.role.slug === 'shop_staff') {
      menuItem = await ShopService.updateMenuItemByShopStaff(user, shopId, menuItemId, name, description, price)
    } else {
      menuItem = await ShopService.updateMenuItem(shopId, menuItemId, name, description, price)
    }
    return menuItem
  },

  async deleteMenuItem(user, query) {
    const { shopId, menuItemId } = query
    if (user.role.slug === 'shop_staff') {
      await ShopService.deleteMenuItemByShopStaff(user, shopId, menuItemId)
    } else {
      await ShopService.deleteMenuItem(shopId, menuItemId)
    }
    return { message: 'menu item deleted' }
  },

  async showReservations(user, query) {
    const { shopId } = query
    let reservations
    if (user.role.slug === 'shop_staff') {
      reservations = await ShopService.fetchShopReservationsByShopStaff(user, shopId)
    } else {
      reservations = await ShopService.fetchShopReservations(shopId)
    }
    return reservations
  },

  async insertReservation(user, query) {
    const { reservationDate, userId, stylistId } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    let reservation
    if (user.role.slug === 'shop_staff') {
      reservation = await ShopService.insertReservationByShopStaff(user, shopId, reservationDate, userId, stylistId)
    } else {
      reservation = await ShopService.insertReservation(shopId, reservationDate, userId, stylistId)
    }
    return reservation
  },

  async updateReservation(user, query) {
    const { reservationDate, userId, stylistId } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, reservationId } = query
    let reservation
    if (user.role.slug === 'shop_staff') {
      reservation = await ShopService.updateReservationByShopStaff(user, shopId, reservationId,
        reservationDate, userId, stylistId)
    } else {
      reservation = await ShopService.updateReservation(shopId, reservationId, reservationDate, userId, stylistId)
    }
    return reservation
  },

  async deleteReservation(user, query) {
    const { shopId, reservationId } = query
    if (user.role.slug === 'shop_staff') {
      await ShopService.deleteReservationByShopStaff(user, shopId, reservationId)
    } else {
      await ShopService.deleteReservation(reservationId)
    }
    return { message: 'Reservation deleted' }
  },
}

export default ShopController
