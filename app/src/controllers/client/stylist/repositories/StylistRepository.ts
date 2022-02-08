import { StylistRepositoryInterface } from '@client/stylist/services/StylistService'
import prisma from '@lib/prisma'
import { convertEntityOrderToRepositoryOrder } from '@prismaConverters/Common'
import { reconstructStylist } from '@prismaConverters/Stylist'

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
