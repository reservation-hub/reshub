import { ShopRepositoryInterface as ShopServiceSocket } from '@stylist/services/ShopService'
import prisma from '@lib/prisma'
import { ShopRepositoryInterface as StylistServiceSocket } from '../services/StylistService'

const ShopRepository: ShopServiceSocket & StylistServiceSocket = {
  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

  async fetchShopName(shopId) {
    return (await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shopDetail: { select: { name: true } } },
    }))?.shopDetail.name ?? null
  },

}

export default ShopRepository
