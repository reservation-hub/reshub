import { Stylist } from '@entities/Stylist'
import { StylistServiceInterface } from '@dashboard/DashboardController'
import StylistRepository from '@dashboard/repositories/StylistRepository'
import ReservationRepository from '@dashboard/repositories/ReservationRepository'

export type StylistRepositoryInterface = {
  fetchShopStaffStylists(userId: number): Promise<Stylist[]>
}

export type ReservationRepositoryInterface = {
  fetchReservationsCountByStylistIds(stylistIds: number[]): Promise<{ stylistId: number, reservationCount: number }[]>
}

const StylistService: StylistServiceInterface = {
  async fetchStylistsWithReservationCount(user) {
    const stylists = await StylistRepository.fetchShopStaffStylists(user.id)
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
