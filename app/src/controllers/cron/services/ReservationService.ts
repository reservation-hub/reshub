import { ReservationServiceInterface } from '@cron/CronController'
import ReservationRepository from '@cron/repositories/ReservationRepository'
import today from '@lib/Today'

export type ReservationRepositoryInterface = {
  setReservationStatuses(date: Date): Promise<void>
}

const ReservationService: ReservationServiceInterface = {
  async setReservationStatuses() {
    await ReservationRepository.setReservationStatuses(today)
  },
}

export default ReservationService
