import prisma from '@lib/prisma'
import { ShopRepositoryInterface } from '../services/MenuService'

const ShopRepository: ShopRepositoryInterface = {
  async shopExists(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    })
    return Boolean(shop)
  },

  async fetchUserShopIds(userId) {
    const userShops = await prisma.shop.findMany({
      where: { shopUser: { userId } },
    })
    return userShops.map(s => s.id)
  },
}

export default ShopRepository
