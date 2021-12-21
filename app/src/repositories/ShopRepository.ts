import { Prisma, Days } from '@prisma/client'
import { Shop } from '@entities/Shop'
import { ShopRepositoryInterface as ShopServiceSocket } from '@services/ShopService'
import { ScheduleDays } from '@entities/Common'
import prisma from '@/prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

const shopWithShopDetailsAndAreaAndPrefectureAndCity = Prisma.validator<Prisma.ShopArgs>()(
  {
    include: {
      shopDetail: true, area: true, prefecture: true, city: true,
    },
  },
)
type shopWithShopDetailsAndAreaAndPrefectureAndCity =
Prisma.ShopGetPayload<typeof shopWithShopDetailsAndAreaAndPrefectureAndCity>

const convertEntityDayToPrismaDay = (day: ScheduleDays): Days => {
  switch (day) {
    case ScheduleDays.MONDAY:
      return Days.MONDAY
    case ScheduleDays.TUESDAY:
      return Days.TUESDAY
    case ScheduleDays.WEDNESDAY:
      return Days.WEDNESDAY
    case ScheduleDays.THURSDAY:
      return Days.THURSDAY
    case ScheduleDays.FRIDAY:
      return Days.FRIDAY
    case ScheduleDays.SATURDAY:
      return Days.SATURDAY
    default:
      return Days.SUNDAY
  }
}

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

export const reconstructShop = (shop: shopWithShopDetailsAndAreaAndPrefectureAndCity): Shop => ({
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
  startTime: shop.shopDetail.startTime,
  endTime: shop.shopDetail.endTime,
  details: shop.shopDetail?.details ?? undefined,
})

export const ShopRepository: CommonRepositoryInterface<Shop> & ShopServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const shops = await prisma.shop.findMany({
      skip: skipIndex,
      orderBy: { id: order === DescOrder ? Prisma.SortOrder.desc : Prisma.SortOrder.asc },
      take: limit,
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })

    return shops.map(s => reconstructShop(s))
  },

  async totalCount() {
    return prisma.shop.count()
  },

  async fetch(id) {
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

  async fetchShopsByIds(shopIds) {
    const shops = await prisma.shop.findMany({
      where: { id: { in: shopIds } },
      include: {
        shopDetail: true,
        area: true,
        prefecture: true,
        city: true,
      },
    })
    return shops.map(s => reconstructShop(s))
  },

  async insertShop(name,
    areaId,
    prefectureId,
    cityId,
    address,
    phoneNumber,
    days,
    startTime,
    endTime,
    details) {
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
            address,
            phoneNumber,
            days: days.map(d => convertEntityDayToPrismaDay(d)),
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
  async updateShop(id,
    name,
    areaId,
    prefectureId,
    cityId,
    address,
    phoneNumber,
    days,
    startTime,
    endTime,
    details) {
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
  async searchShops(keyword) {
    const shopsResult = await prisma.$queryRaw('SELECT * FROM "ShopDetail" WHERE (name ILIKE $1)', `${keyword}%`)
    return shopsResult
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

  async fetchValidShopIds(shopIds) {
    const validShopIds = await prisma.shop.findMany({
      where: { id: { in: shopIds } },
      select: { id: true },
    })
    return validShopIds.map(obj => obj.id)
  },

  async fetchShopMenus(shopId) {
    return prisma.menu.findMany({
      where: { shopId },
    })
  },

  async fetchMenusByIds(menuIds) {
    return prisma.menu.findMany({
      where: { id: { in: menuIds } },
    })
  },

  async insertMenu(shopId, name, description, price, duration) {
    return prisma.menu.create({
      data: {
        name,
        description,
        price,
        duration,
        shop: {
          connect: { id: shopId },
        },
      },
    })
  },

  async updateMenu(menuId, name, description, price, duration) {
    return prisma.menu.update({
      where: { id: menuId },
      data: {
        name, description, price, duration,
      },
    })
  },

  async deleteMenu(menuId) {
    return prisma.menu.delete({ where: { id: menuId } })
  },

  async fetchUserShops(userId) {
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

  async fetchUserShopsCount(userId) {
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
