import { ReservationRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'
import {
  ReservationStatus as PrismaReservationStatus,
  Reservation as PrismaReservation,
} from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'

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

const reconstructReservation = (reservation: PrismaReservation)
: Reservation => ({
  id: reservation.id,
  shopId: reservation.shopId,
  reservationDate: reservation.reservationDate,
  status: convertReservationStatus(reservation.status),
  clientId: reservation.userId,
  menuId: reservation.menuId,
  stylistId: reservation.stylistId ?? undefined,
})

const ReservationRepository: ReservationRepositoryInterface = {
  async fetchUserReservationCount(userId) {
    return prisma.reservation.count({ where: { userId } })
  },

  async fetchUserReservations(userId, take) {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      take,
      orderBy: { createdAt: 'desc' },
    })

    return reservations.map(reconstructReservation)
  },

  async fetchCompletedReservationsShopIdsAndVisitedDate(userId) {
    const reservations = await prisma.reservation.findMany({
      where: { userId, AND: { status: 'COMPLETED' } },
    })
    return reservations.map(r => ({
      shopId: r.shopId,
      visitedDate: r.reservationDate,
    }))
  },
}

export default ReservationRepository
