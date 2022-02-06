import { convertDateTimeObjectToDateTimeString, convertDateStringToDateObject } from '@lib/Date'
import { Menu } from '@entities/Menu'
import { Reservation as EntityReservation, ReservationStatus as EntityReservationStatus } from '@entities/Reservation'
import { Reservation, ReservationStatus } from '@request-response-types/models/Reservation'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { User, UserForAuth } from '@entities/User'
import ReservationService from '@reservation/services/ReservationService'
import { ReservationControllerInterface } from '@controller-adapter/Shop'
import { OrderBy } from '@request-response-types/Common'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { indexCalendarSchema, indexSchema, reservationUpsertSchema } from './schemas'
import ShopService from './services/ShopService'

export type ReservationServiceInterface = {
  fetchReservationsWithClientAndStylistAndMenu(user: UserForAuth, shopId: number, page?: number,
    order?: EntityOrderBy, take?: number): Promise<(
      EntityReservation & { client: User, menu: Menu, shop: Shop, stylist?: Stylist })[]>
  fetchReservationsWithClientAndStylistAndMenuForCalendar(user: UserForAuth, shopId: number, year: number,
    month: number): Promise<(EntityReservation & { client: User, menu: Menu, shop: Shop, stylist?: Stylist })[]>
  fetchShopReservationTotalCount(user: UserForAuth, shopId: number): Promise<number>
  fetchReservationWithClientAndStylistAndMenu(user: UserForAuth, shopId: number, reservationId: number)
    : Promise<EntityReservation & { reservationEndDate: Date, client: User, menu: Menu, shop: Shop, stylist?: Stylist }>
  insertReservation(user: UserForAuth, shopId: number, reservationDate: Date,
    clientId: number, menuId: number, stylistId?: number): Promise<EntityReservation &
    { reservationEndDate: Date, client: User, menu: Menu, shop: Shop, stylist?: Stylist }>
  updateReservation(user: UserForAuth, shopId: number, reservationId: number,
    reservationDate: Date, clientId: number, menuId: number, stylistId?: number)
    : Promise<EntityReservation & { reservationEndDate: Date, client: User, menu: Menu, shop: Shop, stylist?: Stylist }>
  cancelReservation(user: UserForAuth, shopId: number, reservationId: number): Promise<EntityReservation
    & { reservationEndDate: Date, client: User, menu: Menu, shop: Shop, stylist?: Stylist }>
}

export type ShopServiceInterface = {
  fetchShopSeatCount(user: UserForAuth, shopId: number): Promise<number>
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

const reconstructReservation = (r: EntityReservation & { reservationEndDate: Date, client: User,
  menu: Menu, shop: Shop, stylist?: Stylist }): Reservation => ({
  id: r.id,
  shopId: r.shopId,
  shopName: r.shop.name,
  clientName: `${r.client.lastNameKana!} ${r.client.firstNameKana!}`,
  menuName: r.menu.name,
  stylistName: r.stylist?.name,
  status: convertStatusToPDO(r.status),
  reservationDate: convertDateTimeObjectToDateTimeString(r.reservationDate),
  reservationEndDate: convertDateTimeObjectToDateTimeString(r.reservationEndDate),
  clientId: r.clientId,
  stylistId: r.stylistId,
  menuId: r.menuId,
})

const ReservationController: ReservationControllerInterface = {
  async index(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { shopId } = query
    const reservations = await ReservationService.fetchReservationsWithClientAndStylistAndMenu(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const totalCount = await ReservationService.fetchShopReservationTotalCount(user, shopId)

    const reservationList = reservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      shopName: r.shop.name,
      clientName: `${r.client.lastNameKana!} ${r.client.firstNameKana!}`,
      menuName: r.menu.name,
      stylistName: r.stylist?.name,
      status: convertStatusToPDO(r.status),
      reservationDate: convertDateTimeObjectToDateTimeString(r.reservationDate),
      clientId: r.clientId,
      menuId: r.menuId,
      stylist: r.stylistId,
    }))

    const seats = await ShopService.fetchShopSeatCount(user, shopId)

    return { values: reservationList, totalCount, seats }
  },

  async indexForCalendar(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId } = query
    const { year, month } = await indexCalendarSchema.parseAsync(query)
    const reservations = await ReservationService.fetchReservationsWithClientAndStylistAndMenuForCalendar(
      user, shopId, year, month,
    )
    const totalCount = await ReservationService.fetchShopReservationTotalCount(user, shopId)

    const reservationList = reservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      shopName: r.shop.name,
      clientName: `${r.client.lastNameKana!} ${r.client.firstNameKana!}`,
      menuName: r.menu.name,
      stylistName: r.stylist?.name,
      status: convertStatusToPDO(r.status),
      reservationDate: convertDateTimeObjectToDateTimeString(r.reservationDate),
    }))

    const seats = await ShopService.fetchShopSeatCount(user, shopId)

    return { values: reservationList, totalCount, seats }
  },

  async show(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, reservationId } = query
    const r = await ReservationService.fetchReservationWithClientAndStylistAndMenu(user, shopId, reservationId)
    return reconstructReservation(r)
  },

  async insert(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      reservationDate, userId, menuId, stylistId,
    } = await reservationUpsertSchema.parseAsync(query.params)
    const reservationDateObject = convertDateStringToDateObject(reservationDate)
    const { shopId } = query
    const r = await ReservationService.insertReservation(user, shopId, reservationDateObject, userId, menuId, stylistId)
    return reconstructReservation(r)
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      reservationDate, userId, menuId, stylistId,
    } = await reservationUpsertSchema.parseAsync(query.params)
    const reservationDateObject = convertDateStringToDateObject(reservationDate)
    const { shopId, reservationId } = query
    const r = await ReservationService.updateReservation(user, shopId, reservationId, reservationDateObject,
      userId, menuId, stylistId)
    return reconstructReservation(r)
  },

  async delete(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, reservationId } = query
    const r = await ReservationService.cancelReservation(user, shopId, reservationId)
    return reconstructReservation(r)
  },

}

export default ReservationController
