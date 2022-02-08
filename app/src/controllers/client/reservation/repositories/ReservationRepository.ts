import { ReservationStatus } from '@prisma/client'
import { ReservationRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@lib/prisma'
import { convertReservationStatusToEntity, reconstructReservation } from '@prismaConverters/Reservation'
import { convertEntityOrderToRepositoryOrder } from '@prismaConverters/Common'

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
      status: convertReservationStatusToEntity(r.status),
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
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      take,
      skip: skipIndex,
      orderBy: { reservationDate: convertEntityOrderToRepositoryOrder(order) },
    })

    return reservations.map(reconstructReservation)
  },

  async fetchUserReservationTotalCount(id) {
    return prisma.reservation.count({ where: { userId: id } })
  },

  async fetchUserReservation(userId, reservationId) {
    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, AND: { userId } },
    })

    return reservation ? reconstructReservation(reservation) : null
  },

  async cancelUserReservation(id) {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
    })
    return reconstructReservation(reservation)
  },
}

export default ReservationRepository
