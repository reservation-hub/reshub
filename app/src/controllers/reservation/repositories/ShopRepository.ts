import { ShopRepositoryInterface as ReservationServiceSocket } from '@reservation/services/ReservationService'
import { ShopRepositoryInterface as ShopServiceSocket } from '@reservation/services/ShopService'
import prisma from '@lib/prisma'
import { reconstructShop } from '@prismaConverters/Shop'
import { convertPrismaDayToEntityDay } from '@prismaConverters/Common'

const ShopRepository: ReservationServiceSocket & ShopServiceSocket = {

  async fetchShopsByIds(shopIds) {
    const shops = await prisma.shop.findMany({
      where: { id: { in: shopIds } },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    return shops.map(reconstructShop)
  },

  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

  async fetchShopSchedule(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        shopDetail: true,
      },
    })
    return shop ? {
      startTime: shop.shopDetail.startTime,
      endTime: shop.shopDetail.endTime,
      seats: shop.shopDetail.seats,
    }
      : null
  },

  async fetchShopDetailsForReservation(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopDetail: true, shopUser: true },
    })

    return shop
      ? {
        startTime: shop.shopDetail.startTime,
        endTime: shop.shopDetail.endTime,
        days: shop.shopDetail.days.map(convertPrismaDayToEntityDay),
        seats: shop.shopDetail.seats,
        staffId: shop.shopUser!.userId,
      }
      : null
  },

  async fetchShopSeatCount(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopDetail: true },
    })
    return shop ? shop.shopDetail.seats : null
  },

}

export default ShopRepository
