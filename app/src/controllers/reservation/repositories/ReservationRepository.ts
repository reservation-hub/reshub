import { ReservationStatus } from '@prisma/client'
import { ReservationRepositoryInterface } from '@reservation/services/ReservationService'
import prisma from '@lib/prisma'
import { convertEntityOrderToRepositoryOrder } from '@lib/prismaConverters/Common'
import { convertReservationStatusToEntity, reconstructReservation } from '@lib/prismaConverters/Reservation'

const ReservationRepository: ReservationRepositoryInterface = {

  async fetchShopReservations(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const reservations = await prisma.reservation.findMany({
      where: { shop: { id: shopId } },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
    })
    return reservations.map(r => reconstructReservation(r))
  },

  async fetchShopReservationsForCalendar(shopId, year, month) {
    const requestDateTime = new Date(`${year}-${month}-1`)
    const requestDateTimeNextMonth = new Date(requestDateTime)
    requestDateTimeNextMonth.setMonth(requestDateTimeNextMonth.getMonth() + 1)
    const reservations = await prisma.reservation.findMany({
      where: {
        shop: { id: shopId },
        AND: {
          reservationDate: {
            gte: requestDateTime,
            lt: requestDateTimeNextMonth,
          },
        },
      },
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
        status: ReservationStatus.CANCELLED,
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async reservationExists(reservationId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })
    return Boolean(reservation)
  },
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
}

export default ReservationRepository
