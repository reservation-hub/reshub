import { Stylist } from '@entities/Stylist'
import { StylistServiceInterface } from '@dashboard/DashboardController'
import StylistRepository from '@dashboard/repositories/StylistRepository'
import ReservationRepository from '@dashboard/repositories/ReservationRepository'

export type StylistRepositoryInterface = {
  fetchStylists(): Promise<Stylist[]>
}

export type ReservationRepositoryInterface = {
  fetchReservationsCountByStylistIds(stylistIds: number[]): Promise<{ stylistId: number, reservationCount: number }[]>
}

const StylistService: StylistServiceInterface = {
  async fetchStylistsWithReservationCount() {
    const stylists = await StylistRepository.fetchStylists()
    const stylistReservationCounts = await ReservationRepository.fetchReservationsCountByStylistIds(
      stylists.map(s => s.id),
    )
    return stylists.map(s => ({
      ...s,
      reservationCount: stylistReservationCounts.find(src => src.stylistId === s.id)!.reservationCount,
    }))
  },
}

export default StylistService
