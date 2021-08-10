import { Prisma } from '@prisma/client'
import prisma from './prisma'
import { CommonRepositoryInterface } from './CommonRepository'
import { ShopRepositoryInterface as ShopServiceSocket } from '../services/ShopService'
import { ShopRepositoryInterface as StylistServiceSocket } from '../services/StylistService'
import { Shop, ShopSchedule } from '../entities/Shop'
import { deleteMenuItem } from '../controllers/menuController'

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
      shopDetail: true, area: true, prefecture: true, city: true, menu: { include: { items: true } },
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
  name: shop.shopDetail?.name ?? null,
  address: shop.shopDetail?.address ?? null,
  phoneNumber: shop.shopDetail?.phoneNumber ?? null,
})

export const reconstructShopWithMenu = (shop: shopWithShopDetailsAndLocationAndMenu): Shop => ({
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
  name: shop.shopDetail?.name ?? null,
  address: shop.shopDetail?.address ?? null,
  phoneNumber: shop.shopDetail?.phoneNumber ?? null,
  menu: {
    id: shop.menu!.id,
    items: shop.menu!.items?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
    })),
  },
})

export const ShopRepository: CommonRepositoryInterface<Shop> & ShopServiceSocket & StylistServiceSocket = {
  async fetchAll(page = 0, order = 'asc') {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const limit = 10
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
        shopDetail: true, area: true, prefecture: true, city: true, menu: { include: { items: true } },
      },
    })
    return shop ? reconstructShopWithMenu(shop) : null
  },

  async insertShop(name, areaId, prefectureId, cityId, address, phoneNumber) {
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
    phoneNumber) {
    const shop = await prisma.shop.update({
      where: { id },
      data: {
        area: { connect: { id: areaId } },
        prefecture: { connect: { id: prefectureId } },
        city: { connect: { id: cityId } },
        shopDetail: {
          update: { name, address, phoneNumber },
        },
      },
      include: {
        shopDetail: true, area: true, prefecture: true, city: true,
      },
    })
    const cleanShop = reconstructShop(shop)
    return cleanShop
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

  async insertMenuItem(shopId, name, description, price) {
    const shop = await this.fetch(shopId)
    const menuId = shop!.menu!.id
    return prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        menuId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
      },
    })
  },

  async updateMenuItem(menuItemId, name, description, price) {
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
      },
    })
  },

  async deleteMenuItem(menuItemId) {
    return prisma.menuItem.delete({ where: { id: menuItemId } })
  },
}
