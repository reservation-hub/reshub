import { Prisma, Days } from '@prisma/client'
import { Shop } from '@entities/Shop'
import { ScheduleDays } from '@entities/Common'
import { ShopRepositoryInterface as ShopServiceSocket } from '@shop/services/ShopService'
import { ShopRepositoryInterface as MenuServiceSocket } from '@shop/services/MenuService'
import { ShopRepositoryInterface as StylistServiceSocket } from '@shop/services/StylistService'
import prisma from '@/prisma'

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

const ShopRepository: ShopServiceSocket & MenuServiceSocket &
StylistServiceSocket = {
  async fetchAllShops(page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const shops = await prisma.shop.findMany({
      skip: skipIndex,
      orderBy: { id: order },
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
    phoneNumber, days, startTime, endTime, details) {
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
            days: days.map(convertEntityDayToPrismaDay),
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
    phoneNumber, days, startTime, endTime, details) {
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
