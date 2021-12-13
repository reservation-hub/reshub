import { ShopServiceInterface as ShopControllerSocket } from '@controllers/shopController'
import { ShopServiceInterface as DashboardControllerSocket } from '@controllers/dashboardController'
import { Shop, ShopSchedule } from '@entities/Shop'
import { Reservation } from '@entities/Reservation'
import { MenuItem } from '@entities/Menu'
import { Stylist } from '@entities/Stylist'
import { ShopRepository } from '@repositories/ShopRepository'
import StylistRepository from '@repositories/StylistRepository'
import ReservationRepository from '@repositories/ReservationRepository'
import { LocationRepository } from '@repositories/LocationRepository'
import UserRepository from '@repositories/UserRepository'
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
  fetchShopMenuItems(shopId: number): Promise<MenuItem[]>
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>,
  updateMenuItem(menuItemId: number, name: string, description: string, price: number): Promise<MenuItem>,
  deleteMenuItem(menuItemId: number): Promise<MenuItem>
  fetchValidShopIds(shopIds: number[]): Promise<number[]>
  searchShops(keyword: string): Promise<Shop[]>,
  fetchUserShops(userId: number): Promise<Shop[]>
  fetchUserShopsCount(userId: number): Promise<number>
  // fetchShopsPopularMenus(shopIds: number[]): Promise<MenuItem[]>
  shopIsOwnedByUser(userId: number, shopId: number): Promise<boolean>
  assignShopToStaff(userId: number, shopId: number): void
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>,
}

export type StylistRepositoryInterface = {
  insertStylist(name: string, price: number, shopId: number, days:number[],
    startTime:string, endTime:string): Promise<Stylist>,
  updateStylist(id: number, name: string, price: number, shopId: number,
    days: number[], startTime: string, endTime: string)
    :Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
  fetchStylistsByShopIds(shopIds: number[])
    : Promise<{ id: number, name: string, price: number, shopId:number }[]>,
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ id: number, count: number }[]>,
}

export type ReservationRepositoryInterface = {
  insertReservation(reservationDate: Date, userId: number, shopId: number, menuItemId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(id: number, reservationDate: Date, userId: number, shopId: number,
    menuItemId: number, stylistId?: number): Promise<Reservation>
  cancelReservation(id: number): Promise<Reservation>
  fetchReservationsByShopIds(shopIds: number[])
    : Promise<{ id: number, data: Reservation[] }[]>
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>
  fetchShopsReservations(shopIds: number[]): Promise<Reservation[]>
  fetchShopReservations(shopId: number): Promise<Reservation[]>
}

export type MenuRepositoryInterface = {
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>
}

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

export const ShopService: ShopControllerSocket & DashboardControllerSocket = {

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

  async fetchShopsWithTotalCount(user, params) {
    let shops
    let shopsCount
    if (user.role.slug === 'shop_staff') {
      shops = await ShopRepository.fetchUserShops(user.id)
      shopsCount = await ShopRepository.fetchUserShopsCount(user.id)
    } else {
      shops = await ShopRepository.fetchAll(params)
      shopsCount = await ShopRepository.totalCount()
    }
    return { values: shops, totalCount: shopsCount }
  },

  async fetchShop(user, id) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, id)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }
    return shop
  },

  async insertShop(user, name, areaId, prefectureId, cityId, address, phoneNumber, days, startTime, endTime, details) {
    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      console.error('Location provided is incorrect')
      throw new InvalidParamsError()
    }

    const startHour = convertToUnixTime(startTime)
    const endHour = convertToUnixTime(endTime)
    if (days.length === 0 || endHour <= startHour) {
      console.error('Days are empty | end time is less than or equal to start hour')
      throw new InvalidParamsError()
    }

    const uniqueDays: number[] = days.filter((n, i) => days.indexOf(n) === i)

    const shop = await ShopRepository.insertShop(
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, startTime, endTime, details,
    )
    if (user.role.slug === 'shop_staff') {
      await ShopRepository.assignShopToStaff(user.id, shop.id)
    }
    return shop
  },

  async updateShop(user, id, name, areaId, prefectureId, cityId, address,
    phoneNumber, days, startTime, endTime, details) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, id)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      console.error('Location provided is incorrect')
      throw new InvalidParamsError()
    }

    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }

    const startHour = convertToUnixTime(startTime)
    const endHour = convertToUnixTime(endTime)
    if (days.length === 0 || endHour <= startHour) {
      console.error('Days are empty | end time is less than or equal to start hour')
      throw new InvalidParamsError()
    }

    const uniqueDays: number[] = days.filter((n, i) => days.indexOf(n) === i)

    return ShopRepository.updateShop(
      id,
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, startTime, endTime, details,
    )
  },

  async deleteShop(user, id) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, id)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      console.error('Shop does not exist')
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

  async insertMenuItem(user, shopId, name, description, price) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }
    const menuItem = await ShopRepository.insertMenuItem(shopId, name,
      description, price)
    return menuItem
  },

  async updateMenuItem(user, shopId, menuItemId, name, description, price) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }
    const menuItemIdIsValid = shop.menu!.items.findIndex(item => item.id === menuItemId) !== -1
    if (!menuItemIdIsValid) {
      console.error('Menu item is not of the shop')
      throw new NotFoundError()
    }

    return ShopRepository.updateMenuItem(menuItemId, name,
      description, price)
  },

  async deleteMenuItem(user, shopId, menuItemId) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

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

  async insertStylist(user, shopId, name, price, days, startTime, endTime) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.insertStylist(name, price, shopId, days, startTime, endTime)
    return stylist
  },

  async updateStylist(user, shopId, stylistId, name, price, days, startTime, endTime) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

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

    return StylistRepository.updateStylist(stylistId, name, price, shopId, days, startTime, endTime)
  },

  async deleteStylist(user, shopId, stylistId) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

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

  async fetchShopsReservations(shops) {
    const shopIds = shops.map(s => s.id)
    const reservations = await ReservationRepository.fetchShopsReservations(shopIds)
    return reservations
  },

  async fetchShopReservations(user, shopId) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }
    return ReservationRepository.fetchShopReservations(shopId)
  },

  async insertReservation(user, shopId, reservationDate, clientId, menuItemId, stylistId?) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    let stylist
    const client = await UserRepository.fetch(clientId)
    const shop = await ShopRepository.fetch(shopId)
    if (stylistId) {
      stylist = await StylistRepository.fetch(stylistId)
    }
    if (!client || !shop || (stylistId && !stylist)) {
      console.error('user | shop | stylist does not exist')
      throw new NotFoundError()
    }

    const menuItems = await ShopRepository.fetchShopMenuItems(shop.id)
    if (!menuItems.find(item => item.id === menuItemId)) {
      console.error('Menu Item does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !shop.stylists?.find(stylist => stylist.id === stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }
    return ReservationRepository.insertReservation(reservationDate, clientId, shopId, menuItemId, stylistId)
  },

  async updateReservation(user, shopId, reservationId, reservationDate, clientId, menuItemId, stylistId) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservation = await ReservationRepository.fetch(reservationId)
    if (!reservation) {
      console.error('Reservation does not exist')
      throw new NotFoundError()
    }

    let stylist
    const client = await UserRepository.fetch(clientId)
    const shop = await ShopRepository.fetch(shopId)
    if (stylistId) {
      stylist = await StylistRepository.fetch(stylistId)
    }
    if (!client || !shop || (stylistId && !stylist)) {
      console.error('user | shop | stylist does not exist')
      throw new NotFoundError()
    }

    const menuItems = await ShopRepository.fetchShopMenuItems(shop.id)
    if (!menuItems.find(item => item.id === menuItemId)) {
      console.error('Menu Item does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !shop.stylists?.find(stylist => stylist.id === stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    return ReservationRepository.updateReservation(reservationId, reservationDate,
      clientId, shopId, menuItemId, stylistId)
  },

  async cancelReservation(user, shopId, reservationId) {
    if (user.role.slug === 'shop_staff' && !await ShopRepository.shopIsOwnedByUser(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservation = await ReservationRepository.fetch(reservationId)
    if (!reservation) {
      console.error('Reservation does not exist')
      throw new NotFoundError()
    }

    return ReservationRepository.cancelReservation(reservationId)
  },

}

export default ShopService
