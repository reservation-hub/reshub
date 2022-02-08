import prisma from '@lib/prisma'
import { StylistRepositoryInterface } from '@client/shop/services/StylistService'
import { reconstructStylist } from '@lib/prismaConverters/Stylist'

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
