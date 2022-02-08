import { StylistRepositoryInterface as ShopServiceSocket } from '@dashboard/services/ShopService'
import { StylistRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import { StylistRepositoryInterface as StylistServiceSocket } from '@dashboard/services/StylistService'
import prisma from '@lib/prisma'
import { reconstructStylist } from '@prismaConverters/Stylist'

export const StylistRepository: ShopServiceSocket & ReservationServiceSocket & StylistServiceSocket = {

  async fetchShopStaffStylists(userId) {
    const limit = 5
    const stylists = await prisma.stylist.findMany({
      where: { shop: { shopUser: { userId } } },
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
