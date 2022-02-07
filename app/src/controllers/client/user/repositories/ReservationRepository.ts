import { ReservationRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'
import {
  ReservationStatus as PrismaReservationStatus,
} from '@prisma/client'
import { ReservationStatus } from '@entities/Reservation'

const convertReservationStatus = (status: PrismaReservationStatus): ReservationStatus => {
  switch (status) {
    case PrismaReservationStatus.CANCELLED:
      return ReservationStatus.CANCELLED
    case PrismaReservationStatus.COMPLETED:
      return ReservationStatus.COMPLETED
    default:
      return ReservationStatus.RESERVED
  }
}

const ReservationRepository: ReservationRepositoryInterface = {
  async fetchUserReservationCount(userId) {
    return prisma.reservation.count({ where: { userId } })
  },

  async fetchUserReservations(userId) {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
    })
    return reservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      reservationDate: r.reservationDate,
      status: convertReservationStatus(r.status),
      clientId: r.userId,
      menuId: r.menuId,
      stylistId: r.stylistId ?? undefined,
    }))
  },
}

export default ReservationRepository
