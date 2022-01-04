import { UserForAuth } from '@entities/User'
import { ReservationControllerInterface } from '@controller-adapter/client/Shop'
import { reservationUpsertSchema } from '@client/reservation/schemas'
import ReservationService from '@client/reservation/services/ReservationService'
import ShopService from '@client/reservation/services/ShopService'

export type ReservationServiceInterface = {
  fetchShopReservationsForAvailability(user: UserForAuth, shopId: number, reservationDate: Date,
    menuId: number): Promise<{ id: number, reservationStartDate: Date, reservationEndDate: Date, stylistId?: number}[]>
}

export type ShopServiceInterface = {
  fetchShopSeatCount(user: UserForAuth, shopId: number): Promise<number>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ReservationController: ReservationControllerInterface = {
  async list(user, query) {
    const { shopId } = query
    const {
      reservationDate, menuId,
    } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const reservations = await ReservationService.fetchShopReservationsForAvailability(
      user, shopId, reservationDate, menuId,
    )

    const seats = await ShopService.fetchShopSeatCount(user, shopId)
    return { values: reservations, seats }
  },
}

export default ReservationController
