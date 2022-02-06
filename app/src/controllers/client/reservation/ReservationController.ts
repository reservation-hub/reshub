import { convertDateTimeObjectToDateTimeString, convertDateStringToDateObject } from '@lib/Date'
import { Reservation, ReservationStatus as EntityReservationStatus } from '@entities/Reservation'
import { UserForAuth } from '@entities/User'
import { ReservationControllerInterface as ShopEndpointSocket } from '@controller-adapter/client/Shop'
import { ReservationControllerInterface as UserEndpointSocket } from '@controller-adapter/client/User'
import { indexSchema, reservationQuerySchema, reservationUpsertSchema } from '@client/reservation/schemas'
import ReservationService from '@client/reservation/services/ReservationService'
import ShopService from '@client/reservation/services/ShopService'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { OrderBy } from '@request-response-types/client/Common'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Stylist } from '@entities/Stylist'
import { Shop } from '@entities/Shop'
import { ReservationStatus } from '@request-response-types/client/models/Reservation'

export type ReservationServiceInterface = {
  fetchShopReservationsForAvailability(user: UserForAuth | undefined, shopId: number, reservationDate: Date)
    : Promise<{ id: number, reservationStartDate: Date, reservationEndDate: Date, stylistId?: number}[]>
  createReservation(user: UserForAuth, shopId: number, reservationDate: Date, menuId: number, stylistId?: number)
    : Promise<Reservation>
  fetchUserReservationsWithShopAndMenuAndStylist(user: UserForAuth, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<(Reservation & { shop: Shop, menu: Menu, stylist?: Stylist })[]>
  fetchUserReservationTotalCount(user: UserForAuth): Promise<number>
  fetchUserReservationWithShopAndMenuAndStylist(user: UserForAuth, id: number)
    : Promise<(Reservation & { shop: Shop, menu: Menu, stylist?: Stylist })>
  cancelUserReservation(user: UserForAuth, id: number): Promise<Reservation>
}

export type ShopServiceInterface = {
  fetchShopSeatCount(user: UserForAuth | undefined, shopId: number): Promise<number>
}

const convertOrderByToEntity = (order: OrderBy): EntityOrderBy => {
  switch (order) {
    case OrderBy.ASC:
      return EntityOrderBy.ASC
    default:
      return EntityOrderBy.DESC
  }
}

const convertStatusToPDO = (status: EntityReservationStatus): ReservationStatus => {
  switch (status) {
    case EntityReservationStatus.CANCELLED:
      return ReservationStatus.CANCELLED
    case EntityReservationStatus.COMPLETED:
      return ReservationStatus.COMPLETED
    default:
      return ReservationStatus.RESERVED
  }
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
      throw new UnauthorizedError('User not found in request')
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
      throw new UnauthorizedError('User not found in request')
    }

    const { page, order, take } = await indexSchema.parseAsync(query)
    const reservations = await ReservationService.fetchUserReservationsWithShopAndMenuAndStylist(
      user, page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const totalCount = await ReservationService.fetchUserReservationTotalCount(user)

    return {
      values: reservations.map(r => ({
        id: r.id,
        shopId: r.shopId,
        shopName: r.shop.name,
        menuName: r.menu.name,
        status: convertStatusToPDO(r.status),
        reservationDate: convertDateTimeObjectToDateTimeString(r.reservationDate),
        stylistName: r.stylist?.name,
      })),
      totalCount,
    }
  },

  async userReservation(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }

    const { id } = query
    const reservation = await ReservationService.fetchUserReservationWithShopAndMenuAndStylist(user, id)
    return {
      id: reservation.id,
      shopId: reservation.shopId,
      shopName: reservation.shop.name,
      menuName: reservation.menu.name,
      menuId: reservation.menuId,
      status: convertStatusToPDO(reservation.status),
      reservationDate: convertDateTimeObjectToDateTimeString(reservation.reservationDate),
      stylistName: reservation.stylist?.name,
      stylistId: reservation.stylistId,
    }
  },

  async cancelUserReservation(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }

    const { id } = query
    await ReservationService.cancelUserReservation(user, id)

    return 'Reservation cancelled'
  },
}

export default ReservationController
