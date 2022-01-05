import { Reservation } from '@entities/Reservation'
import { ReservationServiceInterface } from '@client/reservation/ReservationController'
import { InvalidParamsError } from '@errors/ServiceErrors'
import ReservationRepository from '@client/reservation/repositories/ReservationRepository'
import MenuRepository from '@client/reservation/repositories/MenuRepository'
import StylistRepository from '@client/reservation/repositories/StylistRepository'
import Logger from '@lib/Logger'

export type ReservationRepositoryInterface = {
  fetchShopReservationsForAvailabilityWithMenuDuration(shopId: number, reservationDate: Date,
    rangeInDays: number) :Promise<(Reservation & { duration: number})[]>
}

export type MenuRepositoryInterface = {
  fetchShopMenuIds(shopId: number): Promise<number[]>
}

export type StylistRepositoryInterface = {
  fetchShopStylistIds(shopId: number): Promise<number[]>
}

const isValidMenuId = async (shopId: number, menuId: number): Promise<boolean> => {
  const menuIds = await MenuRepository.fetchShopMenuIds(shopId)
  return menuIds.some(id => id === menuId)
}

const isValidStylistId = async (shopId: number, stylistId: number): Promise<boolean> => {
  const stylistIds = await StylistRepository.fetchShopStylistIds(shopId)
  return stylistIds.some(id => id === stylistId)
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
}

export default ReservationService
