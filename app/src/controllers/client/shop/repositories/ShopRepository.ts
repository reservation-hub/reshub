import { Prisma, Days } from '@prisma/client'
import { Shop } from '@entities/Shop'
import { ScheduleDays } from '@entities/Common'
import prisma from '@lib/prisma'
import { ShopRepositoryInterface as ShopServiceSocket } from '../services/ShopService'
import { ShopRepositoryInterface as MenuServiceSocket } from '../services/MenuService'
import { ShopRepositoryInterface as StylistServiceSocket } from '../services/StylistService'

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
  async fetchShops(page, order) {
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
}

export default ShopRepository
