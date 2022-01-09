import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { ScheduleDays } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import prisma from '@lib/prisma'
import { StylistRepositoryInterface } from '../services/StylistService'

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
  async fetchShopStylists(shopId, limit) {
    const stylists = await prisma.stylist.findMany({
      where: { shopId },
      take: limit,
    })
    return stylists.map(reconstructStylist)
  },
}

export default StylistRepository
