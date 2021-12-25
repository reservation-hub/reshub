import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { ShopControllerInterface } from '@controller-adapter/Shop'
import { User, UserForAuth } from '@entities/User'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { ScheduleDays } from '@entities/Common'
import ShopService from '@shop/services/ShopService'
import UserService from '@shop/services/UserService'
import ReservationService from '@shop/services/ReservationService'
import StylistService from '@shop/services/StylistService'
import MenuService from '@shop/services/MenuService'
import { OrderBy } from '@request-response-types/Common'
import { shopUpsertSchema, indexSchema, searchSchema } from './schemas'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: UserForAuth, page?: number, order?: OrderBy)
    : Promise<{ values: Shop[], totalCount: number }>
  fetchShop(user: UserForAuth, id: number): Promise<Shop>
  insertShop(user: UserForAuth, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: ScheduleDays[],
    startTime: string, endTime: string, details: string): Promise<Shop>
  updateShop(user: UserForAuth, id: number, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: ScheduleDays[],
    startTime: string, endTime: string, details: string): Promise<Shop>
  deleteShop(user: UserForAuth, id: number): Promise<Shop>
  searchShops(user: UserForAuth, keyword: string): Promise<Shop[]>
}

export type StylistServiceInterface = {
  fetchShopStylistsWithReservationCount(user: UserForAuth, shopId: number, limit?: number)
    : Promise<(Stylist & { reservationCount: number})[]>
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ shopId: number, stylistCount: number }[]>
}

export type ReservationServiceInterface = {
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ shopId: number, reservationCount: number }[]>
  fetchShopReservations(user: UserForAuth, shopId: number, limit?: number): Promise<Reservation[]>
}

export type MenuServiceInterface = {
  fetchShopMenus(user: UserForAuth, shopId: number, limit?: number): Promise<Menu[]>
}

export type UserServiceInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ShopController: ShopControllerInterface = {
  async index(user, query) {
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { values: shops, totalCount } = await ShopService.fetchShopsWithTotalCount(user, page, order)

    const shopIds = shops.map(shop => shop.id)

    const totalReservationsCount = await ReservationService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await StylistService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      reservationsCount: totalReservationsCount.find(item => item.shopId === shop.id)!.reservationCount,
      stylistsCount: totalStylistsCount.find(item => item.shopId === shop.id)!.stylistCount,
    }))

    return { values, totalCount }
  },

  async show(user, query) {
    const stylistLimit = 5
    const reservationLimit = 5
    const menuLimit = 5
    const { id } = query
    const shop = await ShopService.fetchShop(user, id)
    const stylists = await StylistService.fetchShopStylistsWithReservationCount(user, shop.id, stylistLimit)
    const reservations = await ReservationService.fetchShopReservations(user, shop.id, reservationLimit)
    const menus = await MenuService.fetchShopMenus(user, shop.id, menuLimit)
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
      areaId: shop.area.id,
      prefectureId: shop.prefecture.id,
      prefectureName: shop.prefecture.name,
      cityId: shop.city.id,
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

  async searchShops(user, query) {
    const searchValues = await searchSchema.validateAsync(query, joiOptions)
    const shops = await ShopService.searchShops(user, searchValues.keyword)
    const shopIds = shops.map(s => s.id)
    const totalReservationsCount = await ReservationService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await StylistService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      reservationsCount: totalReservationsCount.find(item => item.shopId === shop.id)!.reservationCount,
      stylistsCount: totalStylistsCount.find(item => item.shopId === shop.id)!.stylistCount,
    }))
    return { values, totalCount: shops.length }
  },

}

export default ShopController
