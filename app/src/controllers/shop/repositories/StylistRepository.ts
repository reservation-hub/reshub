import { Stylist as PrismaStylist } from '@prisma/client'
import { StylistRepositoryInterface as StylistServiceSocket } from '@shop/services/StylistService'
import prisma from '@lib/prisma'
import { convertPrismaDayToEntityDay } from '@prismaConverters/Common'

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
