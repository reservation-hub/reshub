import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { Stylist } from '@entities/Stylist'
import { ScheduleDays } from '@entities/Common'
import { StylistRepositoryInterface as ShopServiceSocket } from '@dashboard/services/ShopService'
import { StylistRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import { StylistRepositoryInterface as StylistServiceSocket } from '@dashboard/services/StylistService'
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

export const reconstructStylist = (stylist: PrismaStylist): Stylist => ({
  id: stylist.id,
  shopId: stylist.shopId,
  name: stylist.name,
  price: stylist.price,
  days: stylist.days.map(s => convertPrismaDayToEntityDay(s)),
  startTime: stylist.startTime,
  endTime: stylist.endTime,
})

export const StylistRepository: ShopServiceSocket & ReservationServiceSocket & StylistServiceSocket = {

  async fetchStylists() {
    const limit = 5
    const stylists = await prisma.stylist.findMany({
      take: limit,
    })
    return stylists.map(reconstructStylist)
  },

  async fetchStylistsCountByShopIds(shopIds) {
    const stylists = await prisma.stylist.groupBy({
      by: ['shopId'],
      where: { shopId: { in: shopIds } },
      _count: true,
    })

    return stylists.map(s => ({
      shopId: s.shopId,
      stylistCount: s._count,
    }))
  },

  async fetchStylistsByIds(stylistIds) {
    const stylists = await prisma.stylist.findMany({
      where: { id: { in: stylistIds } },
    })
    return stylists.map(reconstructStylist)
  },

}

export default StylistRepository
