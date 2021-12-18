import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import ShopService from '@services/ShopService'
import { ShopListQuery } from '@request-response-types/Shop'
import { ShopControllerInterface } from '@controller-adapter/Shop'
import { User, UserForAuth } from '@entities/User'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import UserService from '@services/UserService'
import { ScheduleDays } from '@entities/Common'
import { shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import { shopStylistUpsertSchema } from './schemas/stylist'
import { searchSchema } from './schemas/search'
import { menuItemUpsertSchema } from './schemas/menu'
import { reservationUpsertSchema } from './schemas/reservation'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: UserForAuth, query: ShopListQuery)
    : Promise<{ values: Shop[], totalCount: number }>
  fetchShop(user: UserForAuth, id: number): Promise<Shop>
  insertShop(user: UserForAuth, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: ScheduleDays[],
    startTime: string, endTime: string, details: string): Promise<Shop>
  updateShop(user: UserForAuth, id: number, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: ScheduleDays[],
    startTime: string, endTime: string, details: string): Promise<Shop>
  deleteShop(user: UserForAuth, id: number): Promise<Shop>
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>
  fetchShopStylistsWithReservationCount(user: UserForAuth, shopId: number)
    : Promise<(Stylist & { reservationCount: number})[]>
  insertStylist(user: UserForAuth, shopId: number, name: string, price: number,
    days:ScheduleDays[], startTime:string, endTime:string)
    : Promise<Stylist>
  updateStylist(user: UserForAuth, shopId: number, stylistId: number, name: string, price: number,
    days: ScheduleDays[], startTime: string, endTime: string)
    : Promise<Stylist>
  deleteStylist(user: UserForAuth, shopId: number, stylistId: number)
    : Promise<Stylist>
  searchShops(keyword: string): Promise<Shop[]>
  fetchShopMenus(user: UserForAuth, shopId: number): Promise<Menu[]>
  insertMenu(user: UserForAuth, shopId: number, name: string, description: string, price: number
    , duration: number)
    : Promise<Menu>
  updateMenu(user: UserForAuth, shopId: number, menuId: number, name: string,
    description: string, price: number, duration: number): Promise<Menu>
  deleteMenu(user: UserForAuth, shopId: number, menuId: number): Promise<Menu>
  fetchShopReservations(user: UserForAuth, shopId: number): Promise<Reservation[]>
  insertReservation(user: UserForAuth, shopId: number, reservationDate: Date,
    clientId: number, menuId: number, stylistId?: number): Promise<Reservation>
  updateReservation(user: UserForAuth, shopId: number, reservationId: number,
    reservationDate: Date, clientId: number, menuId: number, stylistId?: number)
    : Promise<Reservation>
  cancelReservation(user: UserForAuth, shopId: number, reservationId: number): Promise<Reservation>
}

export type UserServiceInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
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
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      reservationsCount: totalReservationsCount.find(item => item.id === shop.id)!.count,
      stylistsCount: totalStylistsCount.find(item => item.id === shop.id)!.count,
    }))

    return { values, totalCount }
  },

  async show(user, query) {
    const { id } = query
    const shop = await ShopService.fetchShop(user, id)
    const stylists = await ShopService.fetchShopStylistsWithReservationCount(user, shop.id)
    const reservations = await ShopService.fetchShopReservations(user, shop.id)
    const menus = await ShopService.fetchShopMenus(user, shop.id)
    const users = await UserService.fetchUsersByIds(reservations.map(r => r.clientId))

    const stylistList = stylists.map(s => ({
      id: s.id,
      shopId: s.shopId,
      name: s.name,
      price: s.price,
      reservationCount: s.reservationCount,
    }))

    const reservationList = reservations.map(r => {
      const user = users.find(u => u.id === r.clientId)!
      const stylist = stylists.find(s => s.id === r.stylistId)
      const menu = menus.find(m => m.id === r.menuId)!
      return {
        id: r.id,
        shopId: r.shopId,
        shopName: shop.name,
        clientName: `${user.lastNameKana} ${user.firstNameKana}`,
        stylistName: stylist?.name,
        menuName: menu.name,
        status: r.status,
        reservationDate: r.reservationDate,
      }
    })

    return {
      id: shop.id,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      days: shop.days,
      startTime: shop.startTime,
      endTime: shop.endTime,
      name: shop.name,
      address: shop.address,
      details: shop.details,
      phoneNumber: shop.phoneNumber,
      stylists: stylistList,
      reservations: reservationList,
      menu: menus,
      reservationCount: reservations.length,
    }
  },

  async insert(user, query) {
    const {
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query, joiOptions)
    await ShopService.insertShop(user,
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details)

    return 'Shop created'
  },

  async update(user, query) {
    const {
      name, areaId, prefectureId, cityId, address, phoneNumber,
      days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query.params, joiOptions)
    const { id } = query

    await ShopService.updateShop(user, id, name, areaId, prefectureId, cityId,
      address, phoneNumber, days, startTime, endTime, details)

    return 'Shop updated'
  },

  async delete(user, query) {
    const { id } = query
    await ShopService.deleteShop(user, id)
    return 'Shop deleted'
  },

  async insertStylist(user, query) {
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    await ShopService.insertStylist(user, shopId, name, price, days, startTime, endTime)
    return 'Stylist created'
  },

  async updateStylist(user, query) {
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, stylistId } = query
    await ShopService.updateStylist(user, shopId, stylistId, name, price, days, startTime, endTime)
    return 'Stylist updated'
  },

  async deleteStylist(user, query) {
    const { shopId, stylistId } = query
    await ShopService.deleteStylist(user, shopId, stylistId)
    return 'Stylist deleted'
  },

  async searchShops(query) {
    const searchValues = await searchSchema.validateAsync(query, joiOptions)
    const shops = await ShopService.searchShops(searchValues.keyword)
    const shopIds = shops.map(s => s.id)
    const totalReservationsCount = await ShopService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await ShopService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      reservationsCount: totalReservationsCount.find(item => item.id === shop.id)!.count,
      stylistsCount: totalStylistsCount.find(item => item.id === shop.id)!.count,
    }))
    return { values, totalCount: shops.length }
  },

  async insertMenu(user, query) {
    const {
      name, description, price, duration,
    } = await menuItemUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    await ShopService.insertMenu(user, shopId, name, description, price, duration)
    return 'Menu created'
  },

  async updateMenu(user, query) {
    const {
      name, description, price, duration,
    } = await menuItemUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, menuId } = query
    await ShopService.updateMenu(user, shopId, menuId, name, description, price, duration)
    return 'Menu updated'
  },

  async deleteMenu(user, query) {
    const { shopId, menuId } = query
    await ShopService.deleteMenu(user, shopId, menuId)
    return 'Menu deleted'
  },

  async showReservations(user, query) {
    const { shopId } = query
    const shop = await ShopService.fetchShop(user, shopId)
    const reservations = await ShopService.fetchShopReservations(user, shopId)
    const users = await UserService.fetchUsersByIds(reservations.map(r => r.clientId))
    const stylists = await ShopService.fetchShopStylistsWithReservationCount(user, shopId)
    const menus = await ShopService.fetchShopMenus(user, shopId)
    const reservationList = reservations.map(r => {
      const user = users.find(u => u.id === r.clientId)!
      const stylist = stylists.find(s => s.id === r.stylistId)
      const menu = menus.find(m => m.id === r.menuId)!
      return {
        id: r.id,
        shopId: r.shopId,
        shopName: shop.name,
        clientName: `${user.lastNameKana} ${user.firstNameKana}`,
        stylistName: stylist?.name,
        menuName: menu.name,
        status: r.status,
        reservationDate: r.reservationDate,
      }
    })
    return { values: reservationList, totalCount: reservations.length }
  },

  async insertReservation(user, query) {
    const {
      reservationDate, userId, menuId, stylistId,
    } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    await ShopService.insertReservation(user, shopId, reservationDate, userId, menuId, stylistId)
    return 'Reservation created'
  },

  async updateReservation(user, query) {
    const {
      reservationDate, userId, menuId, stylistId,
    } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, reservationId } = query
    await ShopService.updateReservation(user, shopId, reservationId, reservationDate, userId, menuId, stylistId)
    return 'Reservation updated'
  },

  async deleteReservation(user, query) {
    const { shopId, reservationId } = query
    await ShopService.cancelReservation(user, shopId, reservationId)
    return 'Reservation deleted'
  },
}

export default ShopController
