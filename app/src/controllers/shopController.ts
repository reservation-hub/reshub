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
import { shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import { shopStylistUpsertSchema } from './schemas/stylist'
import { searchSchema } from './schemas/search'
import { menuItemUpsertSchema } from './schemas/menu'

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
    if (user.role.slug === 'shop_staff') {
      // await
    } else {

    }
  },

  async insertReservation(user, query) {

  },

  async updateReservation(user, query) {

  },

  async deleteReservation(user, query) {

  },
}

export default ShopController
