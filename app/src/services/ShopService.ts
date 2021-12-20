import { ShopServiceInterface as ShopControllerSocket } from '@controllers/shop/ShopController'
import { ShopServiceInterface as DashboardControllerSocket } from '@controllers/dashboard/DashboardController'
import { Shop } from '@entities/Shop'
import { Reservation } from '@entities/Reservation'
import { Menu } from '@entities/Menu'
import { Stylist } from '@entities/Stylist'
import { ShopRepository } from '@repositories/ShopRepository'
import StylistRepository from '@repositories/StylistRepository'
import ReservationRepository from '@repositories/ReservationRepository'
import { LocationRepository } from '@repositories/LocationRepository'
import UserRepository from '@repositories/UserRepository'
import { RoleSlug } from '@entities/Role'
import { ScheduleDays } from '@entities/Common'
import { AuthorizationError, InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type ShopRepositoryInterface = {
  insertShop(
    name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: ScheduleDays[], startTime: string, endTime: string, details: string) : Promise<Shop>,
  updateShop(
    id: number, name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: ScheduleDays[], startTime: string, endTime: string, details: string) : Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  fetchShopMenus(shopId: number): Promise<Menu[]>
  fetchMenusByIds(menuIds: number[]): Promise<Menu[]>
  insertMenu(shopId: number, name: string, description: string, price: number, duration: number): Promise<Menu>,
  updateMenu(menuId: number, name: string, description: string, price: number,
    duration: number): Promise<Menu>,
  deleteMenu(menuId: number): Promise<Menu>
  fetchValidShopIds(shopIds: number[]): Promise<number[]>
  searchShops(keyword: string): Promise<Shop[]>,
  fetchUserShops(userId: number): Promise<Shop[]>
  fetchUserShopsCount(userId: number): Promise<number>
  fetchUserShopIds(userId: number): Promise<number[]>
  assignShopToStaff(userId: number, shopId: number): void
  fetchShopsByIds(shopIds: number[]): Promise<Shop[]>
}

export type StylistRepositoryInterface = {
  insertStylist(name: string, price: number, shopId: number, days:ScheduleDays[],
    startTime:string, endTime:string): Promise<Stylist>,
  updateStylist(id: number, name: string, price: number, shopId: number,
    days: ScheduleDays[], startTime: string, endTime: string) :Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
  fetchStylistsByIds(stylistIds: number[]): Promise<Stylist[]>
  fetchStylistsByShopIds(shopIds: number[]) : Promise<{ id: number, name: string, price: number, shopId:number }[]>,
  fetchStylistsByShopId(shopId: number): Promise<Stylist[]>
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ id: number, count: number }[]>,
  fetchShopStaffStylists(userId: number): Promise<Stylist[]>
}

export type ReservationRepositoryInterface = {
  insertReservation(reservationDate: Date, userId: number, shopId: number, menuId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(id: number, reservationDate: Date, userId: number, shopId: number,
    menuId: number, stylistId?: number): Promise<Reservation>
  cancelReservation(id: number): Promise<Reservation>
  fetchShopStaffReservations(userId: number, limit?: number): Promise<Reservation[]>
  fetchReservationsByShopIds(shopIds: number[]) : Promise<{ id: number, data: Reservation[] }[]>
  fetchReservationsCountByShopIds(shopIds: number[]) : Promise<{ id: number, count: number }[]>
  fetchShopsReservations(shopIds: number[]): Promise<Reservation[]>
  fetchShopReservations(shopId: number): Promise<Reservation[]>
  fetchStylistReservationCounts(stylistIds: number[]): Promise<{ stylistId: number, reservationCount: number }[]>
}

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

export const nextAvailableDate = (reservationDate: Date, menuDuration: number): Date => {
  const nextAvailableDate = new Date(reservationDate)
  nextAvailableDate.setMinutes(nextAvailableDate.getMinutes() + menuDuration)
  return nextAvailableDate
}

const isUserOwnedShop = async (userId: number, shopIds: number[]): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  const result = shopIds.every(id => userShopIds.find(usid => usid === id))
  return result
}

const isValidMenuId = async (shopId: number, menuId: number): Promise<boolean> => {
  const menus = await ShopRepository.fetchShopMenus(shopId)
  return menus.find(m => m.id === menuId) !== undefined
}

const isValidStylistId = async (shopId: number, stylistId: number): Promise<boolean> => {
  const stylists = await StylistRepository.fetchStylistsByShopId(shopId)
  return stylists.find(s => s.id === stylistId) !== undefined
}

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

  async fetchShopStaffReservationForDashboard(user) {
    return ReservationRepository.fetchShopStaffReservations(user.id, 5)
  },

  async fetchShopStaffStylistsForDashboard(user) {
    return StylistRepository.fetchShopStaffStylists(user.id)
  },

  async fetchShopsByIds(user, shopIds) {
    return ShopRepository.fetchShopsByIds(shopIds)
  },

  async fetchStylistsByIds(user, stylistIds) {
    return StylistRepository.fetchStylistsByIds(stylistIds)
  },

  async fetchMenusByIds(user, menuIds) {
    return ShopRepository.fetchMenusByIds(menuIds)
  },

  async fetchStylistsReservationCounts(user, stylistIds) {
    return ReservationRepository.fetchStylistReservationCounts(stylistIds)
  },

  async fetchShopsWithTotalCount(user, params) {
    let shops
    let shopsCount
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      shops = await ShopRepository.fetchUserShops(user.id)
      shopsCount = await ShopRepository.fetchUserShopsCount(user.id)
    } else {
      shops = await ShopRepository.fetchAll(params)
      shopsCount = await ShopRepository.totalCount()
    }
    return { values: shops, totalCount: shopsCount }
  },

  async fetchShop(user, id) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [id])) {
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

    const uniqueDays: ScheduleDays[] = days.filter((n, i) => days.indexOf(n) === i)

    const shop = await ShopRepository.insertShop(
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, startTime, endTime, details,
    )
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      await ShopRepository.assignShopToStaff(user.id, shop.id)
    }
    return shop
  },

  async updateShop(user, id, name, areaId, prefectureId, cityId, address,
    phoneNumber, days, startTime, endTime, details) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [id])) {
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

    const uniqueDays: ScheduleDays[] = days.filter((n, i) => days.indexOf(n) === i)

    return ShopRepository.updateShop(
      id,
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, startTime, endTime, details,
    )
  },

  async deleteShop(user, id) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [id])) {
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

  async fetchShopMenus(user, shopId) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    return ShopRepository.fetchShopMenus(shopId)
  },

  async insertMenu(user, shopId, name, description, price, duration) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const menu = await ShopRepository.insertMenu(shopId, name,
      description, price, duration)
    return menu
  },

  async updateMenu(user, shopId, menuId, name, description, price, duration) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }
    if (!await isValidMenuId(shopId, menuId)) {
      console.error('Menu is not of the shop')
      throw new NotFoundError()
    }

    return ShopRepository.updateMenu(menuId, name,
      description, price, duration)
  },

  async deleteMenu(user, shopId, menuId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }
    if (!await isValidMenuId(shopId, menuId)) {
      console.error('Menu not found')
      throw new NotFoundError()
    }

    return ShopRepository.deleteMenu(menuId)
  },

  async fetchShopStylistsWithReservationCount(user, shopId) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylists = await StylistRepository.fetchStylistsByShopId(shopId)
    const reservations = await ReservationRepository.fetchStylistReservationCounts(stylists.map(s => s.id))
    return stylists.map(s => ({
      ...s,
      reservationCount: reservations.find(r => r.stylistId === s.id)!.reservationCount,
    }))
  },

  async insertStylist(user, shopId, name, price, days, startTime, endTime) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylist = await StylistRepository.insertStylist(name, price, shopId, days, startTime, endTime)
    return stylist
  },

  async updateStylist(user, shopId, stylistId, name, price, days, startTime, endTime) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
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
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
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

  async fetchShopReservations(user, shopId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
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

  async insertReservation(user, shopId, reservationDate, clientId, menuId, stylistId?) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
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

    if (!await isValidMenuId(shopId, menuId)) {
      console.error('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !isValidStylistId(shopId, stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }
    return ReservationRepository.insertReservation(reservationDate, clientId, shopId, menuId, stylistId)
  },

  async updateReservation(user, shopId, reservationId, reservationDate, clientId, menuId, stylistId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
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

    const menus = await ShopRepository.fetchShopMenus(shop.id)
    if (!menus.find(item => item.id === menuId)) {
      console.error('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !isValidStylistId(shopId, stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    return ReservationRepository.updateReservation(reservationId, reservationDate,
      clientId, shopId, menuId, stylistId)
  },

  async cancelReservation(user, shopId, reservationId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
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
