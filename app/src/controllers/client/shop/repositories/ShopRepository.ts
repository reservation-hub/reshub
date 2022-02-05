import { Prisma, Days } from '@prisma/client'
import { OrderBy, ScheduleDays } from '@entities/Common'
import { Shop } from '@entities/Shop'
import prisma from '@lib/prisma'
import { ShopRepositoryInterface as ShopServiceSocket } from '@client/shop/services/ShopService'
import { ShopRepositoryInterface as MenuServiceSocket } from '@client/shop/services/MenuService'
import { ShopRepositoryInterface as StylistServiceSocket } from '@client/shop/services/StylistService'

const shopWithShopDetailsAndAreaAndPrefectureAndCity = Prisma.validator<Prisma.ShopArgs>()(
  {
    include: {
      shopDetail: true, area: true, prefecture: true, city: true,
    },
  },
)
type shopWithShopDetailsAndAreaAndPrefectureAndCity =
Prisma.ShopGetPayload<typeof shopWithShopDetailsAndAreaAndPrefectureAndCity>

const convertPrismaDayToEntityDay = (day: Days): ScheduleDays => {
  switch (day) {
    case Days.MONDAY:
      return ScheduleDays.MONDAY
    case Days.TUESDAY:
      return ScheduleDays.TUESDAY
    case Days.WEDNESDAY:
      return ScheduleDays.WEDNESDAY
    case Days.THURSDAY:
      return ScheduleDays.THURSDAY
    case Days.FRIDAY:
      return ScheduleDays.FRIDAY
    case Days.SATURDAY:
      return ScheduleDays.SATURDAY
    default:
      return ScheduleDays.SUNDAY
  }
}

const convertEntityOrderToRepositoryOrder = (order: OrderBy): Prisma.SortOrder => {
  switch (order) {
    case OrderBy.ASC:
      return Prisma.SortOrder.asc
    default:
      return Prisma.SortOrder.desc
  }
}

const reconstructShop = (shop: shopWithShopDetailsAndAreaAndPrefectureAndCity): Shop => ({
  id: shop.id,
  area: {
    id: shop.area.id,
    name: shop.area.name,
    slug: shop.area.slug,
  },
  prefecture: {
    id: shop.prefecture.id,
    name: shop.prefecture.name,
    slug: shop.prefecture.slug,
  },
  city: {
    id: shop.city.id,
    name: shop.city.name,
    slug: shop.city.slug,
  },
  name: shop.shopDetail?.name,
  address: shop.shopDetail?.address ?? undefined,
  phoneNumber: shop.shopDetail?.phoneNumber ?? undefined,
  days: shop.shopDetail?.days.map(d => convertPrismaDayToEntityDay(d)),
  seats: shop.shopDetail.seats,
  startTime: shop.shopDetail.startTime,
  endTime: shop.shopDetail.endTime,
  details: shop.shopDetail?.details ?? undefined,
})

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
}

export default ShopRepository
