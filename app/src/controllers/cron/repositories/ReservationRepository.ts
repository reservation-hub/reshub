import { ReservationRepositoryInterface } from '@cron/services/ReservationService'
import prisma from '@lib/prisma'
import { ReservationStatus } from '@prisma/client'

const ReservationRepository: ReservationRepositoryInterface = {
  async setReservationStatuses(date) {
    const reservations = await prisma.reservation.updateMany({
      where: {
        reservationDate: {
          lt: date,
        },
        AND: {
          status: ReservationStatus.RESERVED,
        },
      },
      data: {
        status: ReservationStatus.COMPLETED,
      },
    })
    // eslint-disable-next-line
    console.log(reservations)
  },
}

export default ReservationRepository
