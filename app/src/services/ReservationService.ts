import { ReservationServiceInterface } from '../controllers/reservationController'
import ReservationRepository from '../repositories/ReservationRepository'
import { NotFoundError } from './Errors/ServiceError'

export type ReservationRepositoryInterface = {

}

export type upsertReservationQuery = {
  reservationDate: Date,
  shopId: number,
  stylistId: number,
  userId: number,
}

const ReservationService: ReservationServiceInterface = {
  async fetchReservationsWithTotalCount(query) {
    const reservations = await ReservationRepository.fetchAll(query)
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

}

export default ReservationService
