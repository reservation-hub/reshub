import { Shop } from '@entities/Shop'
import prisma from '@lib/prisma'
import { ShopRepositoryInterface as ShopServiceSocket } from '@client/shop/services/ShopService'
import { ShopRepositoryInterface as MenuServiceSocket } from '@client/shop/services/MenuService'
import { ShopRepositoryInterface as StylistServiceSocket } from '@client/shop/services/StylistService'
import setPopularShops from '@lib/PopularShopSetter'
import redis from '@lib/redis'
import { convertEntityOrderToRepositoryOrder } from '@prismaConverters/Common'
import { reconstructShop } from '@prismaConverters/Shop'

const ShopRepository: ShopServiceSocket & MenuServiceSocket & StylistServiceSocket = {
  async fetchShops(page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * 5 : 0
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

  async fetchShopsTotalCount() {
    return prisma.shop.count()
  },

  async fetchShop(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    return shop ? reconstructShop(shop) : null
  },

  async shopExists(shopId) {
    return (await prisma.shop.count({ where: { id: shopId } })) > 0
  },

  async fetchShopsByArea(page, order, take, areaId, prefectureId, cityId) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const shops = await prisma.shop.findMany({
      where: {
        areaId,
        AND: {
          prefectureId,
          cityId,
        },
      },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })

    return shops.map(reconstructShop)
  },

  async fetchShopsTotalCountByArea(areaId, prefectureId, cityId) {
    return prisma.shop.count({
      where: {
        areaId,
        AND: {
          prefectureId,
          cityId,
        },
      },
    })
  },

  async fetchShopsByTags(tagIds, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const shops = (await prisma.shopTags.findMany({
      where: { tagId: { in: tagIds } },
      distinct: ['shopId'],
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      select: {
        shop: {
          include: {
            shopDetail: true, area: true, prefecture: true, city: true,
          },
        },
      },
    })).map(s => ({ ...s.shop }))
    return shops.map(reconstructShop)
  },

  async fetchShopsTotalCountByTags(tagIds) {
    return (await prisma.shopTags.findMany({
      where: { tagId: { in: tagIds } },
      distinct: ['shopId'],
    })).length
  },

  async fetchShopsByName(name, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const shops = await prisma.shop.findMany({
      where: { shopDetail: { name: { contains: name } } },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    return shops.map(reconstructShop)
  },

  async fetchShopsTotalCountByName(name) {
    return prisma.shop.count({ where: { shopDetail: { name: { contains: name } } } })
  },

  async fetchPopularShops() {
    const cachedShops = await redis.get('popularShops')
    let shops: (Shop & { ranking: number })[] = []
    if (cachedShops) {
      const result = JSON.parse(cachedShops as string)
      const shopsBeforeReconstruct = await prisma.shop.findMany({
        where: {
          id: {
            in: result.map((r: {
          shopId: number,
          averageReviewScore: number,
          rankingFactor: number
        }) => r.shopId),
          },
        },
        include: {
          shopDetail: true, area: true, prefecture: true, city: true,
        },
      })
      shops = shopsBeforeReconstruct.map((sbr, i) => {
        const cleanShop = reconstructShop(sbr)
        return { ...cleanShop, ranking: i + 1 }
      })
    }
    return shops
  },

  setPopularShops,

}

export default ShopRepository
