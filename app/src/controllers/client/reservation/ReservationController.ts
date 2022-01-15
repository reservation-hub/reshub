import { Reservation } from '@entities/Reservation'
import { UserForAuth } from '@entities/User'
import { ReservationControllerInterface } from '@controller-adapter/client/Shop'
import { reservationQuerySchema, reservationUpsertSchema } from '@client/reservation/schemas'
import ReservationService from '@client/reservation/services/ReservationService'
import ShopService from '@client/reservation/services/ShopService'
import Logger from '@lib/Logger'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { convertDateStringToDateObject } from '@lib/Date'

export type ReservationServiceInterface = {
  fetchShopReservationsForAvailability(user: UserForAuth | undefined, shopId: number, reservationDate: Date)
    : Promise<{ id: number, reservationStartDate: Date, reservationEndDate: Date, stylistId?: number}[]>
  createReservation(user: UserForAuth, shopId: number, reservationDate: Date, menuId: number, stylistId?: number)
    : Promise<Reservation>
}

export type ShopServiceInterface = {
  fetchShopSeatCount(user: UserForAuth | undefined, shopId: number): Promise<number>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ReservationController: ReservationControllerInterface = {
  async list(user, query) {
    const { shopId } = query
    const { reservationDate } = await reservationQuerySchema.validateAsync(query.params, joiOptions)
    const reservationDateObject = convertDateStringToDateObject(reservationDate)
    const reservations = await ReservationService.fetchShopReservationsForAvailability(
      user, shopId, reservationDateObject,
    )

    const seats = await ShopService.fetchShopSeatCount(user, shopId)
    return { values: reservations, seats }
  },

  async create(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }

    const { shopId } = query
    const {
      reservationDate, menuId, stylistId,
    } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const reservationDateObject = convertDateStringToDateObject(reservationDate)
    await ReservationService.createReservation(user, shopId, reservationDateObject, menuId, stylistId)

    return 'Reservation created successfully'
  },
}

export default ReservationController
