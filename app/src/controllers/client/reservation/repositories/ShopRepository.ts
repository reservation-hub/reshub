import { ShopRepositoryInterface as ShopServiceSocket } from '@client/reservation/services/ShopService'
import { ShopRepositoryInterface as ReservationServiceSocket } from '@client/reservation/services/ReservationService'
import prisma from '@lib/prisma'
import { convertPrismaDayToEntityDay } from '@prismaConverters/Common'
import { reconstructShop } from '@prismaConverters/Shop'

const ShopRepository: ShopServiceSocket & ReservationServiceSocket = {
  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

  async fetchShopSeatCount(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopDetail: true },
    })

    return shop ? shop.shopDetail.seats : null
  },

  async fetchShopDetailsForReservation(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopDetail: true },
    })

    return shop
      ? {
        startTime: shop.shopDetail.startTime,
        endTime: shop.shopDetail.endTime,
        days: shop.shopDetail.days.map(convertPrismaDayToEntityDay),
        seats: shop.shopDetail.seats,
      }
      : null
  },

  async fetchShopsByIds(ids) {
    const shops = await prisma.shop.findMany({
      where: { id: { in: ids } },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })

    return shops.map(reconstructShop)
  },
}

export default ShopRepository
