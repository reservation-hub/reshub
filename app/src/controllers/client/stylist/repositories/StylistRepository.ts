import { Prisma, Stylist as PrismaStylist, Days } from '@prisma/client'
import { OrderBy, ScheduleDays } from '@entities/Common'
import { StylistRepositoryInterface } from '@client/stylist/services/StylistService'
import { Stylist } from '@entities/Stylist'
import prisma from '@lib/prisma'

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

const convertEntityOrderToRepositoryOrder = (order: OrderBy): Prisma.SortOrder => {
  switch (order) {
    case OrderBy.ASC:
      return Prisma.SortOrder.asc
    default:
      return Prisma.SortOrder.desc
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
  async fetchShopStylists(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const stylists = await prisma.stylist.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
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
