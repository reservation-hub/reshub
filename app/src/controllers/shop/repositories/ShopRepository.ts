import { ShopRepositoryInterface as ShopServiceSocket } from '@shop/services/ShopService'
import { ShopRepositoryInterface as MenuServiceSocket } from '@shop/services/MenuService'
import { ShopRepositoryInterface as StylistServiceSocket } from '@shop/services/StylistService'
import prisma from '@lib/prisma'
import { convertEntityDayToPrismaDay, convertEntityOrderToRepositoryOrder } from '@prismaConverters/Common'
import { reconstructShop } from '@prismaConverters/Shop'

const ShopRepository: ShopServiceSocket & MenuServiceSocket &
StylistServiceSocket = {
  async fetchAllShops(page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const shops = await prisma.shop.findMany({
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })

    return shops.map(reconstructShop)
  },

  async totalCount() {
    return prisma.shop.count()
  },

  async fetchShop(id) {
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        shopDetail: true,
        area: true,
        prefecture: true,
        city: true,
      },
    })
    return shop ? reconstructShop(shop) : null
  },

  async insertShop(name, areaId, prefectureId, cityId, address,
    phoneNumber, days, seats, startTime, endTime, details) {
    const shop = await prisma.shop.create({
      data: {
        area: {
          connect: { id: areaId },
        },
        prefecture: {
          connect: { id: prefectureId },
        },
        city: {
          connect: { id: cityId },
        },
        shopDetail: {
          create: {
            name,
            nameForSearch: name.toLowerCase(),
            address,
            phoneNumber,
            days: days.map(convertEntityDayToPrismaDay),
            seats,
            startTime,
            endTime,
            details,
          },
        },
      },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    const cleanShop = reconstructShop(shop)
    return cleanShop
  },
  async updateShop(id, name, areaId, prefectureId, cityId, address,
    phoneNumber, days, seats, startTime, endTime, details) {
    const shop = await prisma.shop.update({
      where: { id },
      data: {
        area: { connect: { id: areaId } },
        prefecture: { connect: { id: prefectureId } },
        city: { connect: { id: cityId } },
        shopDetail: {
          update: {
            name,
            address,
            phoneNumber,
            days: days.map(d => convertEntityDayToPrismaDay(d)),
            seats,
            startTime,
            endTime,
            details,
          },
        },
      },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    const cleanShop = reconstructShop(shop)
    return cleanShop
  },

  async searchShops(keyword, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const shops = await prisma.shop.findMany({
      where: { shopDetail: { name: { contains: keyword } } },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    return shops.map(reconstructShop)
  },

  async searchShopsTotalCount(keyword) {
    return prisma.shop.count({ where: { shopDetail: { name: { contains: keyword } } } })
  },

  async staffShopSearchTotalCount(keyword, userId) {
    return prisma.shop.count({ where: { shopDetail: { name: { contains: keyword } }, AND: { shopUser: { userId } } } })
  },

  async deleteShop(id) {
    const shop = await prisma.shop.delete({
      where: { id },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    const cleanShop = reconstructShop(shop)
    return cleanShop
  },

  async fetchStaffShops(userId) {
    const shops = await prisma.shop.findMany({
      where: {
        shopUser: { userId },
      },
      include: {
        shopDetail: true,
        area: true,
        prefecture: true,
        city: true,
      },

    })
    return shops.map(s => reconstructShop(s))
  },

  async fetchUserShopIds(userId) {
    const shopIds = await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })
    return shopIds.map(ids => ids.id)
  },

  async fetchStaffTotalShopsCount(userId) {
    return prisma.shop.count({
      where: {
        shopUser: { userId },
      },
    })
  },

  async assignShopToStaff(userId, shopId) {
    await prisma.shopUser.create({
      data: {
        userId, shopId,
      },
    })
  },

}

export default ShopRepository
