import { Reservation } from '@entities/Reservation'
import { UserForAuth } from '@entities/User'
import { ReservationControllerInterface } from '@controller-adapter/client/Shop'
import { reservationQuerySchema, reservationUpsertSchema } from '@client/reservation/schemas'
import ReservationService from '@client/reservation/services/ReservationService'
import ShopService from '@client/reservation/services/ShopService'
import Logger from '@lib/Logger'
import { UnauthorizedError } from '@errors/ControllerErrors'

export type ReservationServiceInterface = {
  fetchShopReservationsForAvailability(user: UserForAuth | undefined, shopId: number, reservationDate: Date,
    menuId: number): Promise<{ id: number, reservationStartDate: Date, reservationEndDate: Date, stylistId?: number}[]>
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
    const {
      reservationDate, menuId,
    } = await reservationQuerySchema.validateAsync(query.params, joiOptions)
    const reservations = await ReservationService.fetchShopReservationsForAvailability(
      user, shopId, reservationDate, menuId,
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

    await ReservationService.createReservation(user, shopId, reservationDate, menuId, stylistId)

    return 'Not yet implemented'
  },
}

export default ReservationController
