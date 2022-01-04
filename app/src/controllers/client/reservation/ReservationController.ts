// import { Reservation } from '@entities/Reservation'
import { UserForAuth } from '@entities/User'
import { ReservationControllerInterface } from '@controller-adapter/client/Shop'
import ReservationService from '@client/reservation/services/ReservationService'
import { reservationUpsertSchema } from './schemas'

export type ReservationServiceInterface = {
  fetchShopReservationsForAvailability(user: UserForAuth, shopId: number, reservationDate: Date,
    menuId: number, stylistId?: number): Promise<{ id: number, reservationStartDate: Date, reservationEndDate: Date}[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ReservationController: ReservationControllerInterface = {
  async list(user, query) {
    const { shopId } = query
    const {
      reservationDate, menuId, stylistId,
    } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const reservations = await ReservationService.fetchShopReservationsForAvailability(
      user, shopId, reservationDate, menuId, stylistId,
    )
    return reservations
  },
}

export default ReservationController
