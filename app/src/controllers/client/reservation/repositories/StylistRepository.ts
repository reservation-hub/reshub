import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { ScheduleDays } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import { StylistRepositoryInterface } from '@client/reservation/services/ReservationService'
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
  async fetchShopStylist(shopId, stylistId) {
    const stylist = await prisma.stylist.findFirst({
      where: { id: stylistId, AND: { shopId } },
    })
    return stylist ? reconstructStylist(stylist) : null
  },
}

export default StylistRepository
