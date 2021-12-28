import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { User, UserForAuth } from '@entities/User'
import ReservationService from '@reservation/services/ReservationService'
import { ReservationControllerInterface } from '@controller-adapter/Shop'
import { OrderBy } from '@request-response-types/Common'
import { indexCalendarSchema, indexSchema, reservationUpsertSchema } from './schemas'

export type ReservationServiceInterface = {
  fetchReservationsWithClientAndStylistAndMenu(user: UserForAuth, shopId: number, page?: number, order?: OrderBy)
    : Promise<(Reservation & { client: User, menu: Menu, shop: Shop, stylist?: Stylist })[]>
  fetchReservationsWithClientAndStylistAndMenuForCalendar(user: UserForAuth, shopId: number,
    year: number, month: number): Promise<(Reservation & { client: User, menu: Menu, shop: Shop, stylist?: Stylist })[]>
  fetchShopReservationTotalCount(user: UserForAuth, shopId: number): Promise<number>
  fetchReservationWithClientAndStylistAndMenu(user: UserForAuth, shopId: number, reservationId: number)
    : Promise<Reservation & { client: User, menu: Menu, shop: Shop, stylist?: Stylist }>
  insertReservation(user: UserForAuth, shopId: number, reservationDate: Date,
    clientId: number, menuId: number, stylistId?: number): Promise<Reservation>
  updateReservation(user: UserForAuth, shopId: number, reservationId: number,
    reservationDate: Date, clientId: number, menuId: number, stylistId?: number)
    : Promise<Reservation>
  cancelReservation(user: UserForAuth, shopId: number, reservationId: number): Promise<Reservation>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ReservationController: ReservationControllerInterface = {
  async index(user, query) {
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { shopId } = query
    const reservations = await ReservationService.fetchReservationsWithClientAndStylistAndMenu(
      user, shopId, page, order,
    )
    const totalCount = await ReservationService.fetchShopReservationTotalCount(user, shopId)

    const reservationList = reservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      shopName: r.shop.name,
      clientName: `${r.client.lastNameKana!} ${r.client.firstNameKana!}`,
      menuName: r.menu.name,
      stylistName: r.stylist?.name,
      status: r.status,
      reservationDate: r.reservationDate,
    }))

    return { values: reservationList, totalCount }
  },

  async indexForCalendar(user, query) {
    const { shopId } = query
    const { year, month } = await indexCalendarSchema.validateAsync(query, joiOptions)
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
      status: r.status,
      reservationDate: r.reservationDate,
    }))

    return { values: reservationList, totalCount }
  },

  async show(user, query) {
    const { shopId, reservationId } = query
    const r = await ReservationService.fetchReservationWithClientAndStylistAndMenu(user, shopId, reservationId)
    return {
      id: r.id,
      shopId: r.shopId,
      shopName: r.shop.name,
      clientName: `${r.client.lastNameKana!} ${r.client.firstNameKana!}`,
      menuName: r.menu.name,
      stylistName: r.stylist?.name,
      status: r.status,
      reservationDate: r.reservationDate,
    }
  },

  async insert(user, query) {
    const {
      reservationDate, userId, menuId, stylistId,
    } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    await ReservationService.insertReservation(user, shopId, reservationDate, userId, menuId, stylistId)
    return 'Reservation created'
  },

  async update(user, query) {
    const {
      reservationDate, userId, menuId, stylistId,
    } = await reservationUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, reservationId } = query
    await ReservationService.updateReservation(user, shopId, reservationId, reservationDate, userId, menuId, stylistId)
    return 'Reservation updated'
  },

  async delete(user, query) {
    const { shopId, reservationId } = query
    await ReservationService.cancelReservation(user, shopId, reservationId)
    return 'Reservation deleted'
  },

}

export default ReservationController
