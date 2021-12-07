import { ReservationServiceInterface } from '@controllers/reservationController'
import { ReservationServiceInterface as DashboardControllerSocker } from '@controllers/dashboardController'
import { Reservation } from '@entities/Reservation'
import { User } from '@entities/User'
import { insertReservationQuery } from '@request-response-types/ReservationService'
import ReservationRepository from '@repositories/ReservationRepository'
import UserRepository from '@repositories/UserRepository'
import { ShopRepository } from '@repositories/ShopRepository'
import StylistRepository from '@repositories/StylistRepository'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type ReservationRepositoryInterface = {
  insertReservation(reservationDate: Date, userId: number, shopId: number, stylistId?: number)
    : Promise<Reservation>,
  updateReservation(id: number, reservationDate: Date, userId: number, shopId: number,
    stylistId?: number): Promise<Reservation>,
  deleteReservation(id: number): Promise<Reservation>,
  searchReservations(keyword: string): Promise<User[]>,
  fetchShopsReservations(shopIds: number[]): Promise<Reservation[]>
}

const ReservationService: ReservationServiceInterface & DashboardControllerSocker = {
  async fetchReservationsWithTotalCount(params) {
    const reservations = await ReservationRepository.fetchAll(params)
    const reservationCounts = await ReservationRepository.totalCount()
    return { data: reservations, totalCount: reservationCounts }
  },

  async fetchReservation(id) {
    const reservation = await ReservationRepository.fetch(id)
    if (!reservation) {
      throw new NotFoundError()
    }

    return reservation
  },

  async searchReservations(keyword) {
    const reservations = await ReservationRepository.searchReservations(keyword)
    return reservations
  },
  async insertReservation(params: insertReservationQuery) {
    let stylist
    const user = await UserRepository.fetch(params.userId)
    const shop = await ShopRepository.fetch(params.shopId)
    if (params.stylistId) {
      stylist = await StylistRepository.fetch(params.stylistId)
    }
    if (!user || !shop || (params.stylistId && !stylist)) {
      console.error('user | shop | stylist does not exist')
      throw new NotFoundError()
    }

    if (!shop.stylists?.find(stylist => stylist.id === params.stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(params.reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    return ReservationRepository.insertReservation(
      params.reservationDate,
      params.userId,
      params.shopId,
      params.stylistId,
    )
  },

  async updateReservation({ id, params }) {
    const reservation = await ReservationRepository.fetch(id)
    if (!reservation) {
      throw new NotFoundError()
    }

    let stylist
    const user = await UserRepository.fetch(params.userId)
    const shop = await ShopRepository.fetch(params.shopId)
    if (params.stylistId) {
      stylist = await StylistRepository.fetch(params.stylistId)
    }
    if (!user || !shop || (params.stylistId && !stylist)) {
      console.error('user | shop | stylist does not exist')
      throw new NotFoundError()
    }

    if (!shop.stylists?.find(stylist => stylist.id === params.stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(params.reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    return ReservationRepository.updateReservation(
      id,
      params.reservationDate,
      params.userId,
      params.shopId,
      params.stylistId,
    )
  },

  async deleteReservation(id) {
    const reservation = await ReservationRepository.fetch(id)
    if (!reservation) {
      throw new NotFoundError()
    }

    return ReservationRepository.deleteReservation(id)
  },

  async fetchShopsReservations(shops) {
    const shopIds = shops.map(s => s.id)
    const reservations = await ReservationRepository.fetchShopsReservations(shopIds)
    return reservations
  },
}

export default ReservationService
