import { Prisma } from '@prisma/client'
import { Shop, ShopSchedule } from '@entities/Shop'
import { ShopRepositoryInterface as ShopServiceSocket } from '@services/ShopService'
import { StylistSchedule } from '@entities/Stylist'
import prisma from './prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'
import { convertReservationStatus } from './ReservationRepository'

const shopWithShopDetailsAndAreaAndPrefectureAndCity = Prisma.validator<Prisma.ShopArgs>()(
  {
    include: {
      shopDetail: true, area: true, prefecture: true, city: true,
    },
  },
)
type shopWithShopDetailsAndAreaAndPrefectureAndCity =
Prisma.ShopGetPayload<typeof shopWithShopDetailsAndAreaAndPrefectureAndCity>

const shopWithShopDetailsAndLocationAndMenu = Prisma.validator<Prisma.ShopArgs>()(
  {
    include: {
      shopDetail: true,
      area: true,
      prefecture: true,
      city: true,
      menu: { include: { items: true } },
      stylists: true,
      reservations: { include: { user: { include: { role: true } }, stylist: true, menuItem: true } },
    },
  },
)
type shopWithShopDetailsAndLocationAndMenu =
Prisma.ShopGetPayload<typeof shopWithShopDetailsAndLocationAndMenu>

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
  schedule: shop.shopDetail?.schedule as ShopSchedule,
  details: shop.shopDetail?.details ?? undefined,
})

export const reconstructShopWithMenuAndStylists = (shop: shopWithShopDetailsAndLocationAndMenu): Shop => ({
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
  address: shop.shopDetail!.address ?? undefined,
  phoneNumber: shop.shopDetail!.phoneNumber ?? undefined,
  schedule: shop.shopDetail?.schedule as ShopSchedule,
  details: shop.shopDetail!.details ?? undefined,
  menu: {
    id: shop.menu!.id,
    items: shop.menu!.items?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      duration: item.duration,
    })),
  },
  stylists: shop.stylists.map(s => ({
    id: s.id,
    name: s.name,
    price: s.price,
    schedule: s.schedule as StylistSchedule,
  })),
  reservations: shop.reservations.map(r => ({
    id: r.id,
    reservationDate: r.reservationDate,
    user: {
      id: r.user.id,
      email: r.user.email,
      role: r.user!.role!,
    },
    status: convertReservationStatus(r.status),
    stylist: r.stylist ? {
      id: r.stylist.id,
      name: r.stylist.name,
      price: r.stylist.price,
      schedule: r.stylist.schedule as StylistSchedule,
    } : undefined,
    menuItem: r.menuItem,
  })),
})

export const ShopRepository: CommonRepositoryInterface<Shop> & ShopServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const shops = await prisma.shop.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })

    const cleanShops = shops.map(shop => reconstructShop(shop))
    return cleanShops
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
        menu: { include: { items: true } },
        stylists: true,
        reservations: { include: { user: { include: { role: true } }, stylist: true, menuItem: true } },
      },
    })
    return shop ? reconstructShopWithMenuAndStylists(shop) : null
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
            schedule: {
              days,
              startTime,
              endTime,
            },
            details,
          },
        },
        menu: {
          create: {},
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
            schedule: {
              days,
              startTime,
              endTime,
            },
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

  async upsertSchedule(shopId, days, start, end) {
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        shopDetail: {
          update: {
            schedule: {
              days,
              hours: { start, end },
            },
          },
        },
      },
      include: {
        shopDetail: true,
      },
    })
    return shop.shopDetail?.schedule as ShopSchedule
  },

  async insertMenuItem(shopId, name, description, price, duration) {
    const shop = await this.fetch(shopId)
    const menuId = shop!.menu!.id
    return prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        menuId,
        duration,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
      },
    })
  },

  async updateMenuItem(menuItemId, name, description, price, duration) {
    return prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        name, description, price,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
      },
    })
  },

  async deleteMenuItem(menuItemId) {
    return prisma.menuItem.delete({ where: { id: menuItemId } })
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
        menu: { include: { items: true } },
        stylists: true,
        reservations: { include: { user: { include: { role: true } }, stylist: true, menuItem: true } },
      },
    })
    return shops.map(s => reconstructShopWithMenuAndStylists(s))
  },

  async fetchUserShopsCount(userId) {
    return prisma.shop.count({
      where: {
        shopUser: { userId },
      },
    })
  },

  async shopIsOwnedByUser(userId, shopId) {
    const shop = await prisma.shopUser.findUnique({
      where: { shopId },
    })
    return shop?.userId === userId
  },

  async assignShopToStaff(userId, shopId) {
    await prisma.shopUser.create({
      data: {
        userId, shopId,
      },
    })
  },

  async fetchShopMenuItems(shopId) {
    const menu = await prisma.menu.findUnique({
      where: { shopId },
      include: {
        items: true,
      },
    })
    return menu!.items
  },

}
