import { Prisma, Days } from '@prisma/client'
import { Shop } from '@entities/Shop'
import { ShopRepositoryInterface as ShopServiceSocket } from '@dashboard/services/ShopService'
import { ShopRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import { ScheduleDays } from '@entities/Common'
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
  seats: shop.shopDetail.seats,
  startTime: shop.shopDetail.startTime,
  endTime: shop.shopDetail.endTime,
  details: shop.shopDetail?.details ?? undefined,
})

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
