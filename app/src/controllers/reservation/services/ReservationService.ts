import { OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { RoleSlug } from '@entities/Role'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { User } from '@entities/User'

import { ReservationServiceInterface } from '@reservation/ReservationController'
import ReservationRepository from '@reservation/repositories/ReservationRepository'
import MenuRepository from '@reservation/repositories/MenuRepository'
import UserRepository from '@reservation/repositories/UserRepository'
import ShopRepository from '@reservation/repositories/ShopRepository'
import StylistRepository from '@reservation/repositories/StylistRepository'
import {
  OutOfScheduleError, UnavailableError, AuthorizationError, NotFoundError, InvalidParamsError,
} from '@reservation/services/ServiceError'
import Logger from '@lib/Logger'

export type ReservationRepositoryInterface = {
  fetchShopReservations(userId: number, shopId: number, page: number, order: OrderBy): Promise<Reservation[]>
  fetchShopReservationsForCalendar(userId: number, shopId: number, year: number, month: number): Promise<Reservation[]>
  fetchShopTotalReservationCount(shopId: number): Promise<number>
  fetchShopReservation(shopId: number, reservationId: number): Promise<Reservation | null>
  insertReservation(reservationDate: Date, userId: number, shopId: number, menuId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(id: number, reservationDate: Date, userId: number, shopId: number,
    menuId: number, stylistId?: number): Promise<Reservation>
  cancelReservation(id: number): Promise<Reservation>
  reservationExists(reservationId: number): Promise<boolean>
  fetchReservationsDateWithDuration(shopId: number, startDate: Date, eneDate: Date, stylistId?: number):
  Promise<{reservationDate: Date, duration: number}[]>
}

export type MenuRepositoryInterface = {
  fetchMenusByIds(menuIds: number[]): Promise<Menu[]>
  fetchMenuIdsByShopId(shopId: number): Promise<number[]>
  fetchMenuDuration(menuId: number, shopId: number): Promise<number | null>
}

export type UserRepositoryInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
  userExists(userId: number): Promise<boolean>
}

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
  fetchShopsByIds(shopIds: number[]): Promise<Shop[]>
  fetchShopSchedule(shopId: number): Promise<{startTime: string, endTime: string} | null >
}

export type StylistRepositoryInterface = {
  fetchStylistsByIds(stylistIds: number[]): Promise<Stylist[]>
  fetchStylistIdsByShopId(shopId: number): Promise<number[]>
}

const getNextAvailableDate = (reservationDate: Date, menuDuration: number): Date => {
  const nextAvailableDate = new Date(reservationDate)
  nextAvailableDate.setMinutes(nextAvailableDate.getMinutes() + menuDuration)
  return nextAvailableDate
}

const timeToString = (dateTime : Date): string => {
  const hours = dateTime.getHours().toString()
  const minutes = dateTime.getMinutes().toString()
  return `${hours}:${minutes}`
}
const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()
const isWithinShopSchedule = (shopSchedule: {startTime: string,
  endTime: string}, reservationDate: Date, menuDuration: number): boolean => {
  const reservationStartTime = convertToUnixTime(timeToString(reservationDate))
  const reservationEndTime = convertToUnixTime(timeToString(getNextAvailableDate(reservationDate, menuDuration)))
  const shopStartTime = convertToUnixTime(shopSchedule.startTime)
  const shopEndTime = convertToUnixTime(shopSchedule.endTime)
  return !((shopStartTime > reservationStartTime || reservationEndTime > shopEndTime))
}

const getStartAndEndDateFromReservationDate = (reservationDate: Date) => {
  const startDate = new Date(reservationDate.toISOString().split('T')[0])
  const endDate = new Date(startDate.getTime() + (3600 * 1000 * 24) /* one day in ms */)
  return { startDate, endDate }
}

export const checkAvailability = (reservationDates:{reservationDate: Date, duration: number}[],
  wantedReservationDate: Date, wantedReservationMenu: number): boolean => {
  if (reservationDates.length === 0) return true
  return reservationDates.every(r => {
    const rStartTime = r.reservationDate.getTime()
    const rEndTime = getNextAvailableDate(r.reservationDate, r.duration).getTime()
    const wantedReservationEnd = getNextAvailableDate(wantedReservationDate, wantedReservationMenu).getTime()
    return !((rStartTime <= wantedReservationDate.getTime() && wantedReservationDate.getTime() < rEndTime)
      || (rStartTime <= wantedReservationEnd && wantedReservationEnd < rEndTime))
  })
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const isValidMenuId = async (shopId: number, menuId: number): Promise<boolean> => {
  const menuIds = await MenuRepository.fetchMenuIdsByShopId(shopId)
  return menuIds.some(id => id === menuId)
}

const isValidStylistId = async (shopId: number, stylistId: number): Promise<boolean> => {
  const stylistIds = await StylistRepository.fetchStylistIdsByShopId(shopId)
  return stylistIds.some(id => id === stylistId)
}

const recreateReservationList = async (reservations: Reservation[]) => {
  const menuIds: number[] = []
  const clientIds: number[] = []
  const shopIds: number[] = []
  const stylistIds: number[] = []
  reservations.forEach(r => {
    menuIds.push(r.menuId)
    clientIds.push(r.clientId)
    shopIds.push(r.shopId)
    if (r.stylistId) {
      stylistIds.push(r.stylistId)
    }
  })
  const reservationMenus = await MenuRepository.fetchMenusByIds(menuIds)
  const reservationClients = await UserRepository.fetchUsersByIds(clientIds)
  const reservationShops = await ShopRepository.fetchShopsByIds(shopIds)
  const reservationStylists = await StylistRepository.fetchStylistsByIds(stylistIds)

  return reservations.map(r => ({
    ...r,
    shop: reservationShops.find(s => s.id === r.shopId)!,
    stylist: reservationStylists.find(s => s.id === r.stylistId),
    menu: reservationMenus.find(m => m.id === r.menuId)!,
    client: reservationClients.find(c => c.id === r.clientId)!,
  }))
}

const ReservationService: ReservationServiceInterface = {
  async fetchReservationsWithClientAndStylistAndMenu(user, shopId, page = 1, order = OrderBy.DESC) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservations = await ReservationRepository.fetchShopReservations(user.id, shopId, page, order)
    return recreateReservationList(reservations)
  },

  async fetchReservationsWithClientAndStylistAndMenuForCalendar(user, shopId, year, month) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservations = await ReservationRepository.fetchShopReservationsForCalendar(user.id, shopId, year, month)

    return recreateReservationList(reservations)
  },

  async fetchShopReservationTotalCount(user, shopId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return ReservationRepository.fetchShopTotalReservationCount(shopId)
  },

  async fetchReservationWithClientAndStylistAndMenu(user, shopId, reservationId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservation = await ReservationRepository.fetchShopReservation(shopId, reservationId)
    if (!reservation) {
      Logger.debug('Reservation does not exist')
      throw new NotFoundError()
    }

    const reservationMenus = await MenuRepository.fetchMenusByIds([reservation.menuId])
    const reservationClients = await UserRepository.fetchUsersByIds([reservation.clientId])
    const reservationShops = await ShopRepository.fetchShopsByIds([reservation.shopId])
    let reservationStylists: Stylist[]
    if (reservation.stylistId) {
      reservationStylists = await StylistRepository.fetchStylistsByIds([reservation.stylistId])
    } else {
      reservationStylists = []
    }

    return {
      ...reservation,
      shop: reservationShops[0],
      stylist: reservationStylists[0],
      menu: reservationMenus[0],
      client: reservationClients[0],
    }
  },

  async insertReservation(user, shopId, reservationDate, clientId, menuId, stylistId?) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const clientExists = await UserRepository.userExists(clientId)
    if (!clientExists) {
      Logger.debug('User does not exist')
      throw new NotFoundError()
    }

    const menuDuration = await MenuRepository.fetchMenuDuration(menuId, shopId)
    if (!menuDuration) {
      Logger.debug('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !isValidStylistId(shopId, stylistId)) {
      Logger.debug('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      Logger.debug('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    const shopSchedule = await ShopRepository.fetchShopSchedule(shopId)

    if (!shopSchedule) {
      Logger.debug('The reservation Date/Time is unavailable')
      throw new UnavailableError()
    }

    const { startDate, endDate } = getStartAndEndDateFromReservationDate(reservationDate)

    const reservationDatesAndDuration = await ReservationRepository.fetchReservationsDateWithDuration(
      shopId, startDate,
      endDate, stylistId,
    )

    const checkWithShopSchedule = isWithinShopSchedule(shopSchedule, reservationDate, menuDuration)

    if (!checkWithShopSchedule) {
      Logger.debug('The reservation Time doesnt match with Shop Schedule')
      throw new OutOfScheduleError()
    }
    const isAvailability = checkAvailability(reservationDatesAndDuration, reservationDate, menuDuration)

    if (!isAvailability) {
      Logger.debug('The reservation Date/Time is unavailable')
      throw new UnavailableError()
    }
    return ReservationRepository.insertReservation(reservationDate, clientId, shopId, menuId, stylistId)
  },

  async updateReservation(user, shopId, reservationId, reservationDate, clientId, menuId, stylistId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservationExists = await ReservationRepository.reservationExists(reservationId)
    if (!reservationExists) {
      Logger.debug('Reservation does not exist')
      throw new NotFoundError()
    }

    const clientExists = await UserRepository.userExists(clientId)
    if (!clientExists) {
      Logger.debug('User does not exist')
      throw new NotFoundError()
    }

    if (!await isValidMenuId(shopId, menuId)) {
      Logger.debug('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !isValidStylistId(shopId, stylistId)) {
      Logger.debug('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      Logger.debug('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    return ReservationRepository.updateReservation(reservationId, reservationDate,
      clientId, shopId, menuId, stylistId)
  },

  async cancelReservation(user, shopId, reservationId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservationExists = await ReservationRepository.reservationExists(reservationId)
    if (!reservationExists) {
      Logger.debug('Reservation does not exist')
      throw new NotFoundError()
    }

    return ReservationRepository.cancelReservation(reservationId)
  },

}

export default ReservationService
