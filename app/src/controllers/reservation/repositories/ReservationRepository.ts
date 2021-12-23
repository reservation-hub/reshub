import {
  ReservationStatus as PrismaReservationStatus,
  Reservation as PrismaReservation,
} from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface as ReservationServiceSocket } from '@reservation/services/ReservationService'

import prisma from '@/prisma'

export const convertReservationStatus = (status: PrismaReservationStatus): ReservationStatus => {
  switch (status) {
    case PrismaReservationStatus.CANCELLED:
      return ReservationStatus.CANCELLED
    case PrismaReservationStatus.COMPLETED:
      return ReservationStatus.COMPLETED
    default:
      return ReservationStatus.RESERVED
  }
}

export const reconstructReservation = (reservation: PrismaReservation)
: Reservation => ({
  id: reservation.id,
  shopId: reservation.shopId,
  reservationDate: reservation.reservationDate,
  status: convertReservationStatus(reservation.status),
  clientId: reservation.userId,
  menuId: reservation.menuId,
  stylistId: reservation.stylistId ?? undefined,
})

const ReservationRepository: ReservationServiceSocket = {

  async fetchShopReservations(userId, shopId, page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reservations = await prisma.reservation.findMany({
      where: { shop: { shopUser: { userId } }, AND: { shopId } },
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
    return reservations.map(r => reconstructReservation(r))
  },

  async fetchShopTotalReservationCount(shopId) {
    return prisma.reservation.count({ where: { shopId } })
  },

  async fetchShopReservation(shopId, reservationID) {
    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationID, AND: { shopId } },
    })

    return reservation ? reconstructReservation(reservation) : null
  },

}

export default ReservationRepository
