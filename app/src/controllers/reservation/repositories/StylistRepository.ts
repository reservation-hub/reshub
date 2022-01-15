import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { Stylist } from '@entities/Stylist'
import { ScheduleDays } from '@entities/Common'
import { StylistRepositoryInterface as ReservationServiceSocket } from '@reservation/services/ReservationService'
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

export const reconstructStylist = (stylist: PrismaStylist): Stylist => ({
  id: stylist.id,
  shopId: stylist.shopId,
  name: stylist.name,
  price: stylist.price,
  days: stylist.days.map(s => convertPrismaDayToEntityDay(s)),
  startTime: stylist.startTime,
  endTime: stylist.endTime,
})

export const StylistRepository: ReservationServiceSocket = {

  async fetchShopStylist(shopId, stylistId) {
    const stylist = await prisma.stylist.findFirst({
      where: { id: stylistId, AND: { shopId } },
    })
    return stylist ? reconstructStylist(stylist) : null
  },
  async fetchStylistsByIds(stylistIds) {
    const stylists = await prisma.stylist.findMany({
      where: { id: { in: stylistIds } },
    })
    return stylists.map(reconstructStylist)
  },

  async fetchStylistIdsByShopId(shopId) {
    return (await prisma.stylist.findMany({
      where: { shopId },
    })).map(s => s.id)
  },

}

export default StylistRepository
