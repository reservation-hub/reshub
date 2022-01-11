import { ShopRepositoryInterface as ShopServiceSocket } from '@stylist/services/ShopService'
import prisma from '@lib/prisma'
import { ShopRepositoryInterface as StylistServiceSocket } from '@stylist/services/StylistService'
import { Days } from '@prisma/client'
import { ScheduleDays } from '@entities/Common'

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

const ShopRepository: ShopServiceSocket & StylistServiceSocket = {
  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

  async fetchShopName(shopId) {
    return (await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shopDetail: { select: { name: true } } },
    }))?.shopDetail.name ?? null
  },

  async fetchUserShopSchedule(userId, shopId) {
    const shop = await prisma.shop.findFirst({
      where: { id: shopId, AND: { shopUser: { userId } } },
      include: { shopDetail: true },
    })

    return shop ? {
      startTime: shop.shopDetail.startTime,
      endTime: shop.shopDetail.endTime,
      days: shop.shopDetail.days.map(convertPrismaDayToEntityDay),
    } : null
  },
}

export default ShopRepository
