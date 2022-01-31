import { convertDateTimeObjectToDateTimeString, convertDateStringToDateObject } from '@lib/Date'
import { Reservation } from '@entities/Reservation'
import { UserForAuth } from '@entities/User'
import { ReservationControllerInterface as ShopEndpointSocket } from '@controller-adapter/client/Shop'
import { ReservationControllerInterface as UserEndpointSocket } from '@controller-adapter/client/User'
import { indexSchema, reservationQuerySchema, reservationUpsertSchema } from '@client/reservation/schemas'
import ReservationService from '@client/reservation/services/ReservationService'
import ShopService from '@client/reservation/services/ShopService'
import Logger from '@lib/Logger'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Stylist } from '@entities/Stylist'
import { Shop } from '@entities/Shop'

export type ReservationServiceInterface = {
  fetchShopReservationsForAvailability(user: UserForAuth | undefined, shopId: number, reservationDate: Date)
    : Promise<{ id: number, reservationStartDate: Date, reservationEndDate: Date, stylistId?: number}[]>
  createReservation(user: UserForAuth, shopId: number, reservationDate: Date, menuId: number, stylistId?: number)
    : Promise<Reservation>
  fetchUserReservationsWithShopAndMenuAndStylist(user: UserForAuth, page?: number, order?: OrderBy)
    : Promise<(Reservation & { shop: Shop, menu: Menu, stylist?: Stylist })[]>
  fetchUserReservationTotalCount(user: UserForAuth): Promise<number>
}

export type ShopServiceInterface = {
  fetchShopSeatCount(user: UserForAuth | undefined, shopId: number): Promise<number>
}

const ReservationController: ShopEndpointSocket & UserEndpointSocket = {
  async list(user, query) {
    const { shopId } = query
    const { reservationDate } = await reservationQuerySchema.parseAsync(query.params)
    const reservationDateObject = convertDateStringToDateObject(reservationDate)
    const reservations = await ReservationService.fetchShopReservationsForAvailability(
      user, shopId, reservationDateObject,
    )

    const seats = await ShopService.fetchShopSeatCount(user, shopId)
    const values = reservations.map(r => ({
      id: r.id,
      reservationStartDate: convertDateTimeObjectToDateTimeString(r.reservationStartDate),
      reservationEndDate: convertDateTimeObjectToDateTimeString(r.reservationEndDate),
      stylistId: r.stylistId,
    }))
    return { values, seats }
  },

  async create(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }

    const { shopId } = query
    const {
      reservationDate, menuId, stylistId,
    } = await reservationUpsertSchema.parseAsync(query.params)
    const reservationDateObject = convertDateStringToDateObject(reservationDate)
    await ReservationService.createReservation(user, shopId, reservationDateObject, menuId, stylistId)

    return 'Reservation created successfully'
  },

  async userReservationsList(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }

    const { page, order } = await indexSchema.parseAsync(query)
    const reservations = await ReservationService.fetchUserReservationsWithShopAndMenuAndStylist(user, page, order)
    const totalCount = await ReservationService.fetchUserReservationTotalCount(user)

    return {
      values: reservations.map(r => ({
        id: r.id,
        shopId: r.shopId,
        shopName: r.shop.name,
        menuName: r.menu.name,
        status: r.status,
        reservationDate: convertDateTimeObjectToDateTimeString(r.reservationDate),
        stylistName: r.stylist?.name,
      })),
      totalCount,
    }
  },
}

export default ReservationController
