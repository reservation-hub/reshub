import {
  ReservationStatus as PrismaReservationStatus,
  Reservation as PrismaReservation,
} from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@lib/prisma'

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
  async fetchShopReservationsForAvailabilityWithMenuDuration(shopId, reservationDate, rangeInDays) {
    const year = reservationDate.getFullYear()
    const month = reservationDate.getMonth()
    const date = reservationDate.getDate()

    const startDate = new Date(year, month, date)
    const endDate = new Date(year, month, date + rangeInDays)
    const reservations = await prisma.reservation.findMany({
      where: {
        shopId,
        AND: {
          reservationDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      include: { menu: true },
    })

    return reservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      reservationDate: r.reservationDate,
      status: convertReservationStatus(r.status),
      clientId: r.userId,
      menuId: r.menuId,
      stylistId: r.stylistId ?? undefined,
      duration: r.menu.duration,
    }))
  },

  async createReservation(clientId, shopId, reservationDate, menuId, stylistId) {
    const reservation = await prisma.reservation.create({
      data: {
        reservationDate,
        shop: { connect: { id: shopId } },
        stylist: stylistId ? { connect: { id: stylistId } } : undefined,
        user: { connect: { id: clientId } },
        menu: { connect: { id: menuId } },
      },
    })

    return reconstructReservation(reservation)
  },

  async fetchUserReservations(userId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      take,
      skip: skipIndex,
      orderBy: { id: order },
    })

    return reservations.map(reconstructReservation)
  },

  async fetchUserReservationTotalCount(id) {
    return prisma.reservation.count({ where: { userId: id } })
  },
}

export default ReservationRepository
