import { Reservation } from '../entities/Reservation'
import { ReservationServiceInterface } from '../controllers/reservationController'
import { fetchModelsWithTotalCountQuery } from './ServiceCommonTypes'
import ReservationRepository from '../repositories/ReservationRepository'
import { NotFoundError } from './Errors/ServiceError'

export type ReservationRepositoryInterface = {

}

export type upsertReservationQuery = {
  reservationDate: Date,
  shopID: number,
  stylistID: number,
  userID: number,
}

export const fetchReservationsWithTotalCount = async (query: fetchModelsWithTotalCountQuery)
  : Promise<{ data: Reservation[], totalCount: number }> => {
  const reservations = await ReservationRepository.fetchAll(query.page, query.order)
  const reservationCounts = await ReservationRepository.totalCount()
  return { data: reservations, totalCount: reservationCounts }
}

export const fetchReservation = async (id: number): Promise<Reservation> => {
  const reservation = await ReservationRepository.fetch(id)
  if (!reservation) {
    throw new NotFoundError()
  }

  return reservation
}

const ReservationService: ReservationServiceInterface = {
  fetchReservationsWithTotalCount,
  fetchReservation,
}

export default ReservationService
