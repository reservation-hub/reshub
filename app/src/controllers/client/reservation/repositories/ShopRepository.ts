import { ShopRepositoryInterface as ShopServiceSocket } from '@client/reservation/services/ShopService'
import { ShopRepositoryInterface as ReservationServiceSocket } from '@client/reservation/services/ReservationService'
import { ScheduleDays } from '@entities/Common'
import prisma from '@lib/prisma'
import { Days } from '@prisma/client'

const convertPrismaDayToEntityDay = (day: Days): ScheduleDays => {
  switch (day) {
    case Days.MONDAY:
      return ScheduleDays.MONDAY
    case Days.TUESDAY:
      return ScheduleDays.TUESDAY
    case Days.WEDNESDAY:
      return ScheduleDays.WEDNESDAY
    case Days.THURSDAY:
      return ScheduleDays.THURSDAY
    case Days.FRIDAY:
      return ScheduleDays.FRIDAY
    case Days.SATURDAY:
      return ScheduleDays.SATURDAY
    default:
      return ScheduleDays.SUNDAY
  }
}

const ShopRepository: ShopServiceSocket & ReservationServiceSocket = {
  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

  async fetchShopSeatCount(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopDetail: true },
    })

    return shop ? shop.shopDetail.seats : null
  },

  async fetchShopDetailsForReservation(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopDetail: true },
    })

    return shop
      ? {
        startTime: shop.shopDetail.startTime,
        endTime: shop.shopDetail.endTime,
        days: shop.shopDetail.days.map(convertPrismaDayToEntityDay),
        seats: shop.shopDetail.seats,
      }
      : null
  },
}

export default ShopRepository
