import { Prisma, ReservationStatus as PrismaReservationStatus } from '@prisma/client'
import { Reservation, ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface as ShopServiceSocket } from '@services/ShopService'
import { StylistSchedule } from '@entities/Stylist'
import prisma from './prisma'
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

const reservationWithUserAndStylistAndShopWithoutLocation = Prisma.validator<Prisma.ReservationArgs>()(
  {
    include: {
      user: { include: { profile: true, role: true } },
      shop: { include: { shopDetail: true } },
      stylist: { include: { shop: true } },
      menuItem: true,
    },
  },
)
type reservationWithUserAndStylistAndShopWithoutLocation =
Prisma.ReservationGetPayload<typeof reservationWithUserAndStylistAndShopWithoutLocation>

export const reconstructReservation = (reservation: reservationWithUserAndStylistAndShopWithoutLocation)
: Reservation => ({
  id: reservation.id,
  reservationDate: reservation.reservationDate,
  status: convertReservationStatus(reservation.status),
  menuItem: reservation.menuItem,
  shop: {
    id: reservation.shop.id,
    name: reservation.shop.shopDetail?.name,
  },
  stylist: reservation.stylist ? {
    id: reservation.stylist.id,
    name: reservation.stylist.name,
    price: reservation.stylist.price,
    shop: reservation.stylist.shop,
    schedule: reservation.stylist.schedule as StylistSchedule,
  } : undefined,
  user: {
    id: reservation.user.id,
    email: reservation.user.email,
    lastNameKanji: reservation.user.profile?.lastNameKanji,
    firstNameKanji: reservation.user.profile?.firstNameKanji,
    lastNameKana: reservation.user.profile?.lastNameKana,
    firstNameKana: reservation.user.profile?.firstNameKana,
    role: reservation.user.role!,
  },
})

const ReservationRepository: CommonRepositoryInterface<Reservation> & ShopServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reservations = await prisma.reservation.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
      },
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
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
      },
    })
    return reservation ? reconstructReservation(reservation) : null
  },

  async fetchReservationsByShopIds(shopIds) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId: { in: shopIds } },
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
      },
    })

    const finalData = shopIds.map(id => ({
      id,
      data: reservations.filter(reservation => reservation.shopId === id)
        .map(reservation => reconstructReservation(reservation)),
    }))

    return finalData
  },

  async fetchReservationsCountByShopIds(shopIds) {
    const value = await this.fetchReservationsByShopIds(shopIds)
    const finalData = value.map(item => ({ id: item.id, count: item.data.length }))
    return finalData
  },

  async insertReservation(reservationDate, userId, shopId, menuItemId, stylistId?) {
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
        menuItem: {
          connect: { id: menuItemId },
        },
      },
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async updateReservation(id, reservationDate, userId, shopId, menuItemId, stylistId) {
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
        menuItem: {
          connect: { id: menuItemId },
        },
      },
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
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
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async fetchShopsReservations(shopIds) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId: { in: shopIds } },
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
      },
    })
    const cleanReservations = reservations.map(r => reconstructReservation(r))
    return cleanReservations
  },

  async fetchShopReservations(shopId) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId },
      include: {
        user: { include: { profile: true, role: true } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
        menuItem: true,
      },
    })
    const cleanReservations = reservations.map(r => reconstructReservation(r))
    return cleanReservations
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
