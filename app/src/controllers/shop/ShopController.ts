import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { ShopControllerInterface } from '@controller-adapter/Shop'
import { User, UserForAuth } from '@entities/User'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { ScheduleDays } from '@entities/Common'
import ShopService from '@shop/services/ShopService'
import UserService from '@shop/services/UserService'
import { OrderBy } from '@request-response-types/Common'
import { shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import { searchSchema } from './schemas/search'

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
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ shopId: number, count: number }[]>
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ shopId: number, count: number }[]>
  fetchShopStylistsWithReservationCount(user: UserForAuth, shopId: number)
    : Promise<(Stylist & { reservationCount: number})[]>
  searchShops(keyword: string): Promise<Shop[]>
  fetchShopMenus(user: UserForAuth, shopId: number): Promise<Menu[]>
  fetchShopReservationsForShopDetails(user: UserForAuth, shopId: number): Promise<Reservation[]>
  fetchShopReservationsWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: OrderBy)
    : Promise<{ values: Reservation[], totalCount: number}>
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
      reservationsCount: totalReservationsCount.find(item => item.shopId === shop.id)!.count,
      stylistsCount: totalStylistsCount.find(item => item.shopId === shop.id)!.count,
    }))

    return { values, totalCount }
  },

  async show(user, query) {
    const { id } = query
    const shop = await ShopService.fetchShop(user, id)
    const stylists = await ShopService.fetchShopStylistsWithReservationCount(user, shop.id)
    const reservations = await ShopService.fetchShopReservationsForShopDetails(user, shop.id)
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
      reservationsCount: totalReservationsCount.find(item => item.shopId === shop.id)!.count,
      stylistsCount: totalStylistsCount.find(item => item.shopId === shop.id)!.count,
    }))
    return { values, totalCount: shops.length }
  },

}

export default ShopController
