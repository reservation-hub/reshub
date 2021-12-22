import { ShopServiceInterface } from '@shop/ShopController'
import { ScheduleDays, OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { RoleSlug } from '@entities/Role'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { User } from '@entities/User'
import ShopRepository from '@shop/repositories/ShopRepository'
import StylistRepository from '@shop/repositories/StylistRepository'
import ReservationRepository from '@shop/repositories/ReservationRepository'
import LocationRepository from '@shop/repositories/LocationRepository'
import UserRepository from '@shop/repositories/UserRepository'
import { AuthorizationError, InvalidParamsError, NotFoundError } from '@shop/services/ServiceError'

export type ShopRepositoryInterface = {
  fetchAllShops(page: number, order: OrderBy): Promise<Shop[]>
  fetchShop(shopId: number): Promise<Shop | null>
  totalCount(): Promise<number>
  insertShop(
    name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: ScheduleDays[], startTime: string, endTime: string, details: string) : Promise<Shop>
  updateShop(
    id: number, name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: ScheduleDays[], startTime: string, endTime: string, details: string) : Promise<Shop>
  deleteShop(id: number): Promise<Shop>
  fetchShopMenus(shopId: number): Promise<Menu[]>
  searchShops(keyword: string): Promise<Shop[]>
  fetchStaffShops(userId: number, page: number, order: OrderBy): Promise<Shop[]>
  fetchStaffTotalShopsCount(userId: number): Promise<number>
  fetchUserShopIds(userId: number): Promise<number[]>
  assignShopToStaff(userId: number, shopId: number): void
}

export type StylistRepositoryInterface = {
  fetchAllShopStylists(shopId: number, page: number, order: OrderBy): Promise<Stylist[]>
  fetchStylist(stylistId: number): Promise<Stylist | null>
  fetchShopTotalStylistCount(shopId: number): Promise<number>
  insertStylist(name: string, price: number, shopId: number, days:ScheduleDays[],
    startTime:string, endTime:string): Promise<Stylist>
  updateStylist(id: number, name: string, price: number, shopId: number,
    days: ScheduleDays[], startTime: string, endTime: string) :Promise<Stylist>
  deleteStylist(id: number): Promise<Stylist>
  fetchStylistsByShopId(shopId: number): Promise<Stylist[]>
  fetchShopStylistsForShopDetails(shopId: number, limit: number): Promise<Stylist[]>
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ shopId: number, count: number }[]>
}

export type ReservationRepositoryInterface = {
  fetchAllShopReservations(shopId: number, page: number, order: OrderBy): Promise<Reservation[]>
  fetchShopTotalReservationCount(shopId: number): Promise<number>
  fetchReservation(reservationId: number): Promise<Reservation | null>
  insertReservation(reservationDate: Date, userId: number, shopId: number, menuId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(id: number, reservationDate: Date, userId: number, shopId: number,
    menuId: number, stylistId?: number): Promise<Reservation>
  cancelReservation(id: number): Promise<Reservation>
  fetchShopStaffReservations(userId: number, limit?: number): Promise<Reservation[]>
  fetchReservationsCountByShopIds(shopIds: number[]) : Promise<{ shopId: number, count: number }[]>
  fetchShopReservationsForShopDetails(shopId: number): Promise<Reservation[]>
  fetchStylistReservationCounts(stylistIds: number[]): Promise<{ stylistId: number, reservationCount: number }[]>
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>
}

export type UserRepositoryInterface = {
  fetchUser(userId: number): Promise<User | null>
}

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

export const nextAvailableDate = (reservationDate: Date, menuDuration: number): Date => {
  const nextAvailableDate = new Date(reservationDate)
  nextAvailableDate.setMinutes(nextAvailableDate.getMinutes() + menuDuration)
  return nextAvailableDate
}

const isUserOwnedShop = async (userId: number, shopIds: number[]): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  const result = shopIds.some(id => userShopIds.find(usid => usid === id))
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

export const ShopService: ShopServiceInterface = {

  async fetchShopsWithTotalCount(user, page = 1, order = OrderBy.DESC) {
    let shops
    let shopsCount
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      shops = await ShopRepository.fetchStaffShops(user.id, page, order)
      shopsCount = await ShopRepository.fetchStaffTotalShopsCount(user.id)
    } else {
      shops = await ShopRepository.fetchAllShops(page, order)
      shopsCount = await ShopRepository.totalCount()
    }
    return { values: shops, totalCount: shopsCount }
  },

  async fetchShop(user, id) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [id])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shop = await ShopRepository.fetchShop(id)
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

    const shop = await ShopRepository.fetchShop(id)
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

    const shop = await ShopRepository.fetchShop(id)
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
    return StylistRepository.fetchStylistsCountByShopIds(shopIds)
  },

  async fetchReservationsCountByShopIds(shopIds) {
    return ReservationRepository.fetchReservationsCountByShopIds(shopIds)
  },

  async fetchShopMenus(user, shopId) {
    const shop = await ShopRepository.fetchShop(shopId)
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

  async fetchShopStylistsWithReservationCount(user, shopId) {
    const shop = await ShopRepository.fetchShop(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylists = await StylistRepository.fetchShopStylistsForShopDetails(shopId, 5)
    const reservations = await ReservationRepository.fetchStylistReservationCounts(stylists.map(s => s.id))
    return stylists.map(s => ({
      ...s,
      reservationCount: reservations.find(r => r.stylistId === s.id)!.reservationCount,
    }))
  },

  async fetchShopReservationsForShopDetails(user, shopId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    const shop = await ShopRepository.fetchShop(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }
    return ReservationRepository.fetchShopReservationsForShopDetails(shopId)
  },

  async fetchShopReservationsWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC) {
    const shop = await ShopRepository.fetchShop(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservations = await ReservationRepository.fetchAllShopReservations(shopId, page, order)
    const fetchShopTotalReservationCount = await ReservationRepository.fetchShopTotalReservationCount(shopId)

    return { values: reservations, totalCount: fetchShopTotalReservationCount }
  },

  async insertReservation(user, shopId, reservationDate, clientId, menuId, stylistId?) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, [shopId])) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    let stylist
    const client = await UserRepository.fetchUser(clientId)
    const shop = await ShopRepository.fetchShop(shopId)
    if (stylistId) {
      stylist = await StylistRepository.fetchStylist(stylistId)
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

    const reservation = await ReservationRepository.fetchReservation(reservationId)
    if (!reservation) {
      console.error('Reservation does not exist')
      throw new NotFoundError()
    }

    let stylist
    const client = await UserRepository.fetchUser(clientId)
    const shop = await ShopRepository.fetchShop(shopId)
    if (stylistId) {
      stylist = await StylistRepository.fetchStylist(stylistId)
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

    const reservation = await ReservationRepository.fetchReservation(reservationId)
    if (!reservation) {
      console.error('Reservation does not exist')
      throw new NotFoundError()
    }

    return ReservationRepository.cancelReservation(reservationId)
  },

}

export default ShopService
