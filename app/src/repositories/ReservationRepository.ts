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
      stylist: { include: { shops: { include: { shop: true } } } },
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
    shops: reservation.stylist.shops.map(shop => shop.shop),
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

export const fetchAll = async (page = 0, order: any = 'asc'): Promise<Reservation[]> => {
  const skipIndex = page > 1 ? (page - 1) * 10 : 0
  const limit = 10
  const reservations = await prisma.reservation.findMany({
    skip: skipIndex,
    orderBy: { id: order },
    take: limit,
    include: {
      user: { include: { profile: true, roles: { include: { role: true } } } },
      shop: { include: { shopDetail: true } },
      stylist: { include: { shops: { include: { shop: true } } } },
    },
  })

  const cleanReservations = reservations.map(r => reconstructReservation(r))

  return cleanReservations
}

export const totalCount = async (): Promise<number> => prisma.reservation.count()

export const fetch = async (id: number): Promise<Reservation | null> => {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: { include: { profile: true, roles: { include: { role: true } } } },
      shop: { include: { shopDetail: true } },
      stylist: { include: { shops: { include: { shop: true } } } },
    },
  })
  return reservation ? reconstructReservation(reservation) : null
}

export const fetchReservationsByShopIDs = async (shopIDs: number[])
: Promise<{ id: number, data: Reservation[] }[]> => {
  const reservations = await prisma.reservation.findMany({
    where: { shopID: { in: shopIDs } },
    include: {
      user: { include: { profile: true, roles: { include: { role: true } } } },
      shop: { include: { shopDetail: true } },
      stylist: { include: { shops: { include: { shop: true } } } },
    },
  })

  const finalData = shopIDs.map(id => ({
    id,
    data: reservations.filter(reservation => reservation.shopID === id)
      .map(reservation => reconstructReservation(reservation)),
  }))

  return finalData
}

export const fetchReservationsCountByShopIDs = async (shopIDs: number[])
: Promise<{ id: number, count: number }[]> => {
  const value = await fetchReservationsByShopIDs(shopIDs)
  const finalData = value.map(item => ({ id: item.id, count: item.data.length }))
  return finalData
}

const ReservationRepository: CommonRepositoryInterface<Reservation> & ReservationServiceSocket & ShopServiceSocket = {
  fetchAll,
  totalCount,
  fetch,
  fetchReservationsByShopIDs,
  fetchReservationsCountByShopIDs,
}

export default ReservationRepository

// async insertReservation(reservationDate, shopID, stylistID, userID) {
//   try {
//     return {
//       value: await prisma.reservation.create({
//         data: {
//           reservationDate,
//           shop: {
//             connect: { id: shopID },
//           },
//           stylist: {
//             connect: { id: stylistID },
//           },
//           user: {
//             connect: { id: userID },
//           },
//         },
//       }),
//     }
//   } catch (error) {
//     console.error(`Exception : ${error}`)
//     return { error, value: null }
//   }
// },
