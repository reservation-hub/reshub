import prisma from '@lib/prisma'
import { ShopRepositoryInterface } from '@client/review/services/ReviewService'

const ShopRepository: ShopRepositoryInterface = {
  async fetchShopName(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, shopDetail: { select: { name: true } } },
    })
    return shop ? shop.shopDetail.name : null
  },

}

export default ShopRepository
