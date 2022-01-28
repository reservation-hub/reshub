import {
  ReservationStatus as PrismaReservationStatus,
  Reservation as PrismaReservation,
  Prisma,
} from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface as ReservationServiceSocket } from '@shop/services/ReservationService'

import prisma from '@lib/prisma'

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
  async fetchShopReservations(shopId, limit) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId },
      take: limit,
      orderBy: { reservationDate: Prisma.SortOrder.asc },
    })
    return reservations.map(r => reconstructReservation(r))
  },

  async fetchReservationsCountByShopIds(shopIds) {
    const reservations = await prisma.reservation.groupBy({
      by: ['shopId'],
      where: { shopId: { in: shopIds } },
      _count: true,
    })
    return reservations.map(r => ({
      shopId: r.shopId,
      reservationCount: r._count,
    }))
  },

  async fetchCompletedShopReservationsWithStylistPriceAndMenuPrice(shopId) {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()

    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)
    const completedReservations = await prisma.reservation.findMany({
      where: {
        shopId,
        AND: {
          status: 'COMPLETED',
          reservationDate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      },
      include: { menu: true, stylist: true },
    })

    return completedReservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      stylistPrice: r.stylist?.price,
      menuPrice: r.menu.price,
    }))
  },

}

export default ReservationRepository
