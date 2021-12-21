import {
  ReservationStatus as PrismaReservationStatus,
  Reservation as PrismaReservation,
} from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface as ShopServiceSocket } from '@services/ShopService'
import { ReservationRepositoryInterface as UserServiceSocket } from '@services/UserService'
import prisma from '@/prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

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

const ReservationRepository: CommonRepositoryInterface<Reservation> & ShopServiceSocket & UserServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reservations = await prisma.reservation.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })

    const cleanReservations = reservations.map(r => reconstructReservation(r))

    return cleanReservations
  },

  async totalCount() {
    return prisma.reservation.count()
  },

  async fetch(id) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })
    return reservation ? reconstructReservation(reservation) : null
  },

  async fetchReservationsByShopIds(shopIds) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId: { in: shopIds } },
    })

    return shopIds.map(id => ({
      id,
      data: reservations.filter(reservation => reservation.shopId === id)
        .map(reservation => reconstructReservation(reservation)),
    }))
  },

  async fetchShopStaffReservations(userId, limit?) {
    const reservations = await prisma.reservation.findMany({
      where: { shop: { shopUser: { userId } } },
      take: limit,
    })
    return reservations.map(r => reconstructReservation(r))
  },

  async fetchReservationsCountByShopIds(shopIds) {
    const value = await this.fetchReservationsByShopIds(shopIds)
    return value.map(item => ({ id: item.id, count: item.data.length }))
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

  async fetchShopsReservations(shopIds) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId: { in: shopIds } },
    })
    const cleanReservations = reservations.map(r => reconstructReservation(r))
    return cleanReservations
  },

  async fetchShopReservations(shopId) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId },
    })
    const cleanReservations = reservations.map(r => reconstructReservation(r))
    return cleanReservations
  },

  async fetchStylistReservationCounts(stylistIds) {
    const reservations = await prisma.reservation.findMany({
      where: { stylistId: { in: stylistIds } },
    })

    return stylistIds.map(id => ({
      stylistId: id,
      reservationCount: reservations.filter(r => r.stylistId === id).length,
    }))
  },

  async fetchUsersReservationCounts(userIds) {
    const reservations = await prisma.reservation.findMany({
      where: { userId: { in: userIds } },
    })

    return userIds.map(id => ({
      userId: id,
      reservationCount: reservations.filter(r => r.userId === id).length,
    }))
  },

  // async searchReservations(keyword) {
  //   const userIds = await prisma.$queryRaw('SELECT id FROM "User" WHERE (username ILIKE $1 or email ILIKE $2)',
  //     `${keyword}%`,
  //     `${keyword}%`)

  //   let mappedIds = userIds.map((obj: any) => obj.id)
  //   if (mappedIds.length === 0) {
  //     mappedIds = [0]
  //   }
  //   const reservations = await prisma.$queryRaw(`SELECT s.name,r.reservation_date,st.name,st.price,u.email
  //   FROM "Reservation" AS r
  //   INNER JOIN "ShopDetail" AS s ON s.id = r.shop_id
  //   INNER JOIN "Stylist" AS st ON st.id = r.stylist_id
  //   INNER JOIN "User" AS u ON u.id = r.user_id
  //   WHERE r.user_id IN (${mappedIds})`)
  //   return reservations
  // },

}

export default ReservationRepository
