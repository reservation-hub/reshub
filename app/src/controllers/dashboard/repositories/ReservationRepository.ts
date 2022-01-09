import {
  ReservationStatus as PrismaReservationStatus,
  Reservation as PrismaReservation,
} from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import { ReservationRepositoryInterface as ShopServiceSocket } from '@dashboard/services/ShopService'
import { ReservationRepositoryInterface as UserServiceSocket } from '@dashboard/services/UserService'
import { ReservationRepositoryInterface as StylistServiceSocket } from '@dashboard/services/StylistService'

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

const ReservationRepository: ReservationServiceSocket & ShopServiceSocket & UserServiceSocket
  & StylistServiceSocket = {

    async fetchShopStaffReservations(userId) {
      const limit = 5
      const reservations = await prisma.reservation.findMany({
        where: { shop: { shopUser: { userId } } },
        take: limit,
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

    async fetchUsersReservationCounts(userIds) {
      const reservations = await prisma.reservation.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: true,
      })
      return reservations.map(r => ({
        userId: r.userId,
        reservationCount: r._count,
      }))
    },

    async fetchReservationsCountByStylistIds(stylistIds) {
      const reservations = await prisma.reservation.groupBy({
        by: ['stylistId'],
        where: { stylistId: { in: stylistIds } },
        _count: true,
      })
      return reservations.map(r => ({
        stylistId: r.stylistId!,
        reservationCount: r._count,
      }))
    },

  }

export default ReservationRepository
