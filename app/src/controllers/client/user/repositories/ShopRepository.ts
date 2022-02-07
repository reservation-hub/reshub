import { ShopRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'

const ReviewRepository: ShopRepositoryInterface = {
  async fetchShopNamesByIds(shopId) {
    const shop = await prisma.shop.findMany({
      where: { id: { in: shopId } },
      include: { shopDetail: true },
    })
    return shop.map(s => ({
      shopId: s.id,
      shopName: s.shopDetail.name,
    }))
  },
}

export default ReviewRepository
