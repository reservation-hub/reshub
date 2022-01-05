import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { StylistRepositoryInterface } from '@client/stylist/services/StylistService'
import { ScheduleDays } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import prisma from '@/prisma'

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

const reconstructStylist = (stylist: PrismaStylist): Stylist => ({
  id: stylist.id,
  shopId: stylist.shopId,
  name: stylist.name,
  price: stylist.price,
  days: stylist.days.map(s => convertPrismaDayToEntityDay(s)),
  startTime: stylist.startTime,
  endTime: stylist.endTime,
})

const StylistRepository: StylistRepositoryInterface = {
  async fetchShopStylists(shopId, page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const stylists = await prisma.stylist.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
      include: { shop: { include: { shopDetail: true } } },
    })
    return stylists.map(reconstructStylist)
  },

  async fetchShopStylistTotalCount(shopId) {
    return prisma.stylist.count({
      where: { shopId },
    })
  },

}

export default StylistRepository