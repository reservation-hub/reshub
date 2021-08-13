import { Prisma } from '@prisma/client'
import prisma from './prisma'
import { Reservation } from '../entities/Reservation'
import { ReservationRepositoryInterface as ReservationServiceSocket } from '../services/ReservationService'
import { ReservationRepositoryInterface as ShopServiceSocket } from '../services/ShopService'
import { CommonRepositoryInterface } from './CommonRepository'

const reservationWithUserAndStylistAndShopWithoutLocation = Prisma.validator<Prisma.ReservationArgs>()(
  {
    include: {
      user: { include: { profile: true, roles: { include: { role: true } } } },
      shop: { include: { shopDetail: true } },
      stylist: { include: { shop: true } },
    },
  },
)
type reservationWithUserAndStylistAndShopWithoutLocation =
Prisma.ReservationGetPayload<typeof reservationWithUserAndStylistAndShopWithoutLocation>

export const reconstructReservation = (reservation: reservationWithUserAndStylistAndShopWithoutLocation)
: Reservation => ({
  id: reservation.id,
  reservationDate: reservation.reservationDate,
  shop: {
    id: reservation.shop.id,
    name: reservation.shop.shopDetail?.name,
  },
  stylist: {
    id: reservation.stylist.id,
    name: reservation.stylist.name,
    price: reservation.stylist.price,
    shop: reservation.stylist.shop,
  },
  user: {
    id: reservation.user.id,
    email: reservation.user.email,
    lastNameKanji: reservation.user.profile?.lastNameKanji,
    firstNameKanji: reservation.user.profile?.firstNameKanji,
    lastNameKana: reservation.user.profile?.firstNameKana,
    firstNameKana: reservation.user.profile?.firstNameKana,
    roles: reservation.user.roles.map(role => role.role),
  },
})

const ReservationRepository: CommonRepositoryInterface<Reservation> & ReservationServiceSocket & ShopServiceSocket = {
  async fetchAll({ page = 0, order = 'asc' as any, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reservations = await prisma.reservation.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
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
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
      },
    })
    return reservation ? reconstructReservation(reservation) : null
  },

  async fetchReservationsByShopIds(shopIds) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId: { in: shopIds } },
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
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

}

export default ReservationRepository

// async insertReservation(reservationDate, shopId, stylistId, userId) {
//   try {
//     return {
//       value: await prisma.reservation.create({
//         data: {
//           reservationDate,
//           shop: {
//             connect: { id: shopId },
//           },
//           stylist: {
//             connect: { id: stylistId },
//           },
//           user: {
//             connect: { id: userId },
//           },
//         },
//       }),
//     }
//   } catch (error) {
//     console.error(`Exception : ${error}`)
//     return { error, value: null }
//   }
// },
