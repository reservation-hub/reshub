import { Prisma } from '@prisma/client'
import { ReservationRepositoryInterface as ReservationServiceSocket } from '@shop/services/ReservationService'
import prisma from '@lib/prisma'
import { reconstructReservation } from '@prismaConverters/Reservation'

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
