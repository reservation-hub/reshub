import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { ScheduleDays } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import { StylistRepositoryInterface as StylistServiceSocket } from '@shop/services/StylistService'
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

export const StylistRepository: StylistServiceSocket = {

  async fetchShopStylistsWithReservationCounts(shopId, limit) {
    const stylists = await prisma.$queryRaw<(PrismaStylist & { reservationCount: number })[]>(
      `
        SELECT 
          s.*, 
          (
            SELECT COUNT(*) FROM "Reservation" as r
            WHERE stylist_id = s.id
          ) as reservation_count 
        FROM "Stylist" as s
        WHERE shop_id = ${shopId}
        LIMIT ${limit}
      `)

    return stylists.map(s => ({
      id: s.id,
      shopId: s.shopId,
      name: s.name,
      price: s.price,
      days: s.days.map(d => convertPrismaDayToEntityDay(d)),
      startTime: s.startTime,
      endTime: s.endTime,
      reservationCount: s.reservationCount,
    }))
  },

  async fetchStylistsCountByShopIds(shopIds) {
    const result = await prisma.stylist.groupBy({
      by: ['shopId'],
      where: { shopId: { in: shopIds } },
      _count: true,
    })
    return result.map(r => ({
      shopId: r.shopId,
      stylistCount: r._count,
    }))
  },

}

export default StylistRepository
