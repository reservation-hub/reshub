import { ReservationRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import { ReservationRepositoryInterface as ShopServiceSocket } from '@dashboard/services/ShopService'
import { ReservationRepositoryInterface as UserServiceSocket } from '@dashboard/services/UserService'
import { ReservationRepositoryInterface as StylistServiceSocket } from '@dashboard/services/StylistService'
import prisma from '@lib/prisma'
import { reconstructReservation } from '@prismaConverters/Reservation'

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
