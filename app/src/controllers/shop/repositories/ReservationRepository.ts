import {
  ReservationStatus as PrismaReservationStatus,
  Reservation as PrismaReservation,
} from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface } from '@shop/services/ShopService'
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

const ReservationRepository: ReservationRepositoryInterface = {
  async fetchAllShopReservations(shopId, page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reservations = await prisma.reservation.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })

    const cleanReservations = reservations.map(r => reconstructReservation(r))

    return cleanReservations
  },

  async fetchReservation(id) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })
    return reservation ? reconstructReservation(reservation) : null
  },

  async fetchShopTotalReservationCount(shopId) {
    return prisma.reservation.count({
      where: { shopId },
    })
  },

  async fetchShopStaffReservations(userId, limit?) {
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
      count: r._count,
    }))
  },

  async insertReservation(reservationDate, userId, shopId, menuId, stylistId?) {
    const reservation = await prisma.reservation.create({
      data: {
        reservationDate,
        shop: {
          connect: { id: shopId },
        },
        stylist: stylistId ? {
          connect: { id: stylistId },
        } : undefined,
        user: {
          connect: { id: userId },
        },
        menu: {
          connect: { id: menuId },
        },
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async updateReservation(id, reservationDate, userId, shopId, menuId, stylistId) {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        reservationDate,
        shop: {
          connect: { id: shopId },
        },
        stylist: stylistId ? {
          connect: { id: stylistId },
        } : undefined,
        user: {
          connect: { id: userId },
        },
        menu: {
          connect: { id: menuId },
        },
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async cancelReservation(id) {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: PrismaReservationStatus.CANCELLED,
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async fetchShopReservationsForShopDetails(shopId) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId },
      take: 5,
    })
    const cleanReservations = reservations.map(reconstructReservation)
    return cleanReservations
  },

  async fetchStylistReservationCounts(stylistIds) {
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
