import { ShopRepositoryInterface as ShopServiceSocket } from '@dashboard/services/ShopService'
import { ShopRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import prisma from '@lib/prisma'
import { reconstructShop } from '@prismaConverters/Shop'

const ShopRepository: ReservationServiceSocket & ShopServiceSocket = {

  async fetchShops() {
    const limit = 5
    const shops = await prisma.shop.findMany({
      take: limit,
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    return shops.map(reconstructShop)
  },

  async totalCount() {
    return prisma.shop.count()
  },

  async fetchUserShops(userId) {
    const shops = await prisma.shop.findMany({
      where: {
        shopUser: { userId },
      },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },

    })
    return shops.map(reconstructShop)
  },

  async fetchUserShopsCount(userId) {
    return prisma.shop.count({
      where: {
        shopUser: { userId },
      },
    })
  },

  async fetchShopsByIds(shopIds) {
    const shops = await prisma.shop.findMany({
      where: { id: { in: shopIds } },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    return shops.map(reconstructShop)
  },

}

export default ShopRepository
