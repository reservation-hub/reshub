import { ScheduleDays } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { ReservationServiceInterface } from '@client/reservation/ReservationController'
import { InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import ReservationRepository from '@client/reservation/repositories/ReservationRepository'
import MenuRepository from '@client/reservation/repositories/MenuRepository'
import StylistRepository from '@client/reservation/repositories/StylistRepository'
import ShopRepository from '@client/reservation/repositories/ShopRepository'
import Logger from '@lib/Logger'

export type ReservationRepositoryInterface = {
  fetchShopReservationsForAvailabilityWithMenuDuration(shopId: number, reservationDate: Date,
    rangeInDays: number) :Promise<(Reservation & { duration: number })[]>
  createReservation(clientId: number, shopId: number, reservationDate: Date, menuId: number, stylistId?: number)
    : Promise<Reservation>
}

export type MenuRepositoryInterface = {
  fetchShopMenuIds(shopId: number): Promise<number[]>
  fetchMenu(menuId: number): Promise<Menu | null>
}

export type StylistRepositoryInterface = {
  fetchShopStylistIds(shopId: number): Promise<number[]>
}

export type ShopRepositoryInterface = {
  fetchShopSchedule(shopId: number): Promise<{startTime: string, endTime: string, days: ScheduleDays[]} | null>
}

const isValidMenuId = async (shopId: number, menuId: number): Promise<boolean> => {
  const menuIds = await MenuRepository.fetchShopMenuIds(shopId)
  return menuIds.some(id => id === menuId)
}

const isValidStylistId = async (shopId: number, stylistId: number): Promise<boolean> => {
  const stylistIds = await StylistRepository.fetchShopStylistIds(shopId)
  return stylistIds.some(id => id === stylistId)
}

const checkAvailability = (reservationDate: Date, menuDuration: number, shopReservations:
  (Reservation & { duration: number })[]): boolean => {
  if (shopReservations.length === 0) return true
  return shopReservations.every(r => {
    const shopReservationStartTime = r.reservationDate.getTime()
    const shopReservationEndTime = (new Date(r.reservationDate.getTime() + r.duration)).getTime()
    const reservationStartTime = reservationDate.getTime()
    const reservationEndTime = reservationDate.getTime() + menuDuration
    return !((shopReservationStartTime <= reservationStartTime && reservationStartTime < shopReservationEndTime)
        || (shopReservationStartTime <= reservationEndTime && reservationEndTime < shopReservationEndTime))
  })
}

const timeToString = (dateTime : Date): string => {
  const hours = dateTime.getHours().toString()
  const minutes = dateTime.getMinutes().toString()
  return `${hours}:${minutes}`
}

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

const isWithinShopSchedule = (startTime: string, endTime: string, days: ScheduleDays[],
  reservationDate: Date, menuDuration: number): boolean => {
  const reservationStartTime = convertToUnixTime(timeToString(reservationDate))
  const reservationEndTime = convertToUnixTime(timeToString(new Date(reservationDate.getTime() + menuDuration)))
  const shopStartTime = convertToUnixTime(startTime)
  const shopEndTime = convertToUnixTime(endTime)

  const isWithinShopTime = !(shopStartTime > reservationStartTime || reservationEndTime > shopEndTime)

  const reservationDay = reservationDate.getDay()
  const isWithinShopDays = days.some(d => d === reservationDay)

  return isWithinShopTime && isWithinShopDays
}

const ReservationService: ReservationServiceInterface = {
  async fetchShopReservationsForAvailability(user, shopId, reservationDate, menuId) {
    const numberOfDays = 7

    const menuIsValid = await isValidMenuId(shopId, menuId)
    if (!menuIsValid) {
      Logger.debug('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    const reservations = await ReservationRepository.fetchShopReservationsForAvailabilityWithMenuDuration(
      shopId, reservationDate, numberOfDays,
    )

    return reservations.map(r => ({
      id: r.id,
      reservationStartDate: r.reservationDate,
      reservationEndDate: new Date(r.reservationDate.getTime() + r.duration),
      stylistId: r.stylistId,
    }))
  },

  async createReservation(user, shopId, reservationDate, menuId, stylistId) {
    const shopSchedule = await ShopRepository.fetchShopSchedule(shopId)
    if (!shopSchedule) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }

    if (reservationDate < new Date()) {
      Logger.debug('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    const menu = await MenuRepository.fetchMenu(menuId)
    if (!menu || menu.shopId !== shopId) {
      Logger.debug('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    // check shop schedule availability

    const reservationIsWithinShopSchedule = isWithinShopSchedule(shopSchedule.startTime, shopSchedule.endTime,
      shopSchedule.days, reservationDate, menu.duration)

    if (!reservationIsWithinShopSchedule) {
      Logger.debug('Reservation date is not within shop schedule')
      throw new InvalidParamsError()
    }

    // check shop availability

    const reservationsForSameDay = await ReservationRepository.fetchShopReservationsForAvailabilityWithMenuDuration(
      shopId, reservationDate, 1,
    )

    const isAvailable = checkAvailability(reservationDate, menu.duration, reservationsForSameDay)
    if (!isAvailable) {
      Logger.debug('Provided time is not available')
      throw new InvalidParamsError()
    }

    return ReservationRepository.createReservation(user.id, shopId, reservationDate,
      menuId, stylistId)
  },
}

export default ReservationService
