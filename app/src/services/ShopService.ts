import { ShopServiceInterface as ShopControllerSocket } from '@controllers/shopController'
import { ShopServiceInterface as MenuControllerSocket } from '@controllers/menuController'
import { ShopServiceInterface as DashboardControllerSocket } from '@controllers/dashboardController'
import { Shop, ShopSchedule } from '@entities/Shop'
import { Reservation } from '@entities/Reservation'
import { MenuItem } from '@entities/Menu'
import { Stylist } from '@entities/Stylist'
import { ShopRepository } from '@repositories/ShopRepository'
import StylistRepository from '@repositories/StylistRepository'
import ReservationRepository from '@repositories/ReservationRepository'
import { LocationRepository } from '@repositories/LocationRepository'
import { AuthorizationError, InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type ShopRepositoryInterface = {
  insertShop(
    name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: number[], startTime: string, endTime: string, details: string)
    : Promise<Shop>,
  updateShop(
    id: number, name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: number[], startTime: string, endTime: string, details: string)
    : Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  upsertSchedule(shopId: number, days: number[], start: string, end: string)
    : Promise<ShopSchedule>
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>,
  updateMenuItem(menuItemId: number, name: string, description: string, price: number): Promise<MenuItem>,
  deleteMenuItem(menuItemId: number): Promise<MenuItem>
  fetchValidShopIds(shopIds: number[]): Promise<number[]>
  searchShops(keyword: string): Promise<Shop[]>,
  fetchUserShops(userId: number): Promise<Shop[]>
  fetchUserShopsCount(userId: number): Promise<number>
  // fetchShopsPopularMenus(shopIds: number[]): Promise<MenuItem[]>
  shopIsOwnedByUser(userId: number, id: number): Promise<boolean>
  assignShopToStaff(userId: number, id: number): void
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>,
}

export type StylistRepositoryInterface = {
  insertStylist(name: string, price: number, shopId: number): Promise<Stylist>,
  updateStylist(id: number, name: string, price: number, shopId: number)
    :Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
  fetchStylistsByShopIds(shopIds: number[])
    : Promise<{ id: number, name: string, price: number, shopId:number }[]>,
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ id: number, count: number }[]>,
}

export type ReservationRepositoryInterface = {
  fetchReservationsByShopIds(shopIds: number[])
    : Promise<{ id: number, data: Reservation[] }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
}

export type MenuRepositoryInterface = {
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>
}

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

export const ShopService: ShopControllerSocket & MenuControllerSocket & DashboardControllerSocket = {

  async fetchShopsForDashboard() {
    const shops = await ShopRepository.fetchAll({ limit: 5 })
    const shopsCount = await ShopRepository.totalCount()
    return { shops, totalCount: shopsCount }
  },

  async fetchShopsForDashboardForShopStaff(user) {
    const shops = await ShopRepository.fetchUserShops(user.id)
    const totalCount = await ShopRepository.fetchUserShopsCount(user.id)
    return { shops, totalCount }
  },

  async fetchShopsStylists(shops) {
    const shopIds = shops.map(s => s.id)
    return StylistRepository.fetchStylistsByShopIds(shopIds)
  },

  // TODO: implement popular menus
  // async fetchShopsPopularMenus(shops) {
  //   const shopIds = shops.map(s => s.id)
  //   return ShopRepository.fetchShopsPopularMenus(shopIds)
  // },

  async fetchShopsWithTotalCount(params) {
    const shops = await ShopRepository.fetchAll(params)
    const shopsCount = await ShopRepository.totalCount()
    return { values: shops, totalCount: shopsCount }
  },

  async fetchShop(id) {
    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }
    return shop
  },

  async insertShop(name, areaId, prefectureId, cityId, address, phoneNumber, days, startTime, endTime, details) {
    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      console.error('location')
      throw new InvalidParamsError()
    }

    const startHour = convertToUnixTime(startTime)
    const endHour = convertToUnixTime(endTime)
    if (days.length === 0 || endHour <= startHour) {
      console.error('dates')
      throw new InvalidParamsError()
    }

    const uniqueDays: number[] = days.filter((n, i) => days.indexOf(n) === i)

    return ShopRepository.insertShop(
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, startTime, endTime, details,
    )
  },

  async updateShop(id, name, areaId, prefectureId, cityId, address,
    phoneNumber, days, startTime, endTime, details) {
    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      throw new InvalidParamsError()
    }

    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }

    const startHour = convertToUnixTime(startTime)
    const endHour = convertToUnixTime(endTime)
    if (days.length === 0 || endHour <= startHour) {
      throw new InvalidParamsError()
    }

    const uniqueDays: number[] = days.filter((n, i) => days.indexOf(n) === i)

    return ShopRepository.updateShop(
      id,
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, startTime, endTime, details,
    )
  },

  async deleteShop(id) {
    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }
    return ShopRepository.deleteShop(id)
  },
  async searchShops(keyword) {
    const shops = await ShopRepository.searchShops(keyword)
    return shops
  },
  async fetchStylistsCountByShopIds(shopIds) {
    if (shopIds.length === 0) {
      return []
    }
    return StylistRepository.fetchStylistsCountByShopIds(shopIds)
  },

  async fetchReservationsCountByShopIds(shopIds) {
    if (shopIds.length === 0) {
      return []
    }
    return ReservationRepository.fetchReservationsCountByShopIds(shopIds)
  },

  async insertMenuItem({ shopId, params }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }
    const menuItem = await ShopRepository.insertMenuItem(shopId, params.name,
      params.description, params.price)
    return menuItem
  },

  async updateMenuItem({ shopId, menuItemId, params }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }
    const menuItemIdIsValid = shop.menu!.items.findIndex(item => item.id === menuItemId) !== -1
    if (!menuItemIdIsValid) {
      throw new NotFoundError()
    }

    return ShopRepository.updateMenuItem(menuItemId, params.name,
      params.description, params.price)
  },

  async deleteMenuItem({ shopId, menuItemId }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }
    const menuItemIdIsValid = shop.menu!.items.findIndex(item => item.id === menuItemId) !== -1
    if (!menuItemIdIsValid) {
      console.error('menu item not found')
      throw new NotFoundError()
    }

    return ShopRepository.deleteMenuItem(menuItemId)
  },

  async insertStylist(shopId, name, price) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.insertStylist(name, price, shopId)
    return stylist
  },

  async updateStylist(shopId, stylistId, name, price) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.fetch(stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.updateStylist(stylistId, name, price, shopId)
  },

  async deleteStylist(shopId, stylistId) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.fetch(stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.deleteStylist(stylistId)
  },

  // staff logic

  async fetchStaffShop(user, id) {
    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      console.error('Shop is not found')
      throw new NotFoundError()
    }
    if (!await ShopRepository.shopIsOwnedByUser(user.id, id)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return shop
  },

  async insertStaffShop(user, name, areaId, prefectureId, cityId, address,
    phoneNumber, days, startTime, endTime, details) {
    const shop = await this.insertShop(name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details)

    ShopRepository.assignShopToStaff(user.id, shop.id)
    return shop
  },

  async updateStaffShop(user, id, name, areaId, prefectureId, cityId, address,
    phoneNumber, days, startTime, endTime, details) {
    if (!await ShopRepository.shopIsOwnedByUser(user.id, id)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    const shop = await this.updateShop(id, name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details)

    return shop
  },

  async deleteStaffShop(user, id) {
    if (!await ShopRepository.shopIsOwnedByUser(user.id, id)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return this.deleteShop(id)
  },

  async insertStylistByShopStaff(user, shopId, name, price) {
    if (!await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return this.insertStylist(shopId, name, price)
  },

  async updateStylistByShopStaff(user, shopId, stylistId, name, price) {
    if (!await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return this.updateStylist(shopId, stylistId, name, price)
  },

  async deleteStylistByShopStaff(user, shopId, stylistId) {
    if (!await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return this.deleteStylist(shopId, stylistId)
  },

}

export default ShopService
