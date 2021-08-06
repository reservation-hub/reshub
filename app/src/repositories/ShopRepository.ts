import { Prisma } from '@prisma/client'
import prisma from './prisma'
import { CommonRepositoryInterface } from './CommonRepository'
import { ShopRepositoryInterface as ShopServiceSocket } from '../services/ShopService'
import { ShopRepositoryInterface as StylistServiceSocket } from '../services/StylistService'
import { Shop } from '../entities/Shop'

const shopWithShopDetailsAndAreaAndPrefectureAndCity = Prisma.validator<Prisma.ShopArgs>()(
  {
    include: {
      shopDetail: true, area: true, prefecture: true, city: true,
    },
  },
)
type shopWithShopDetailsAndAreaAndPrefectureAndCity =
Prisma.ShopGetPayload<typeof shopWithShopDetailsAndAreaAndPrefectureAndCity>

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

export const fetchAll = async (page = 0, order: any = 'asc'): Promise<Shop[]> => {
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
}

export const totalCount = async (): Promise<number> => prisma.shop.count()

export const fetch = async (id: number): Promise<Shop | null> => {
  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      shopDetail: true, area: true, prefecture: true, city: true,
    },
  })
  return shop ? reconstructShop(shop) : null
}

export const insertShop = async (
  name: string,
  areaId: number,
  prefectureId: number,
  cityId: number,
  address: string,
  phoneNumber: string,
): Promise<Shop> => {
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
    },
    include: {
      shopDetail: true, area: true, prefecture: true, city: true,
    },
  })
  const cleanShop = reconstructShop(shop)
  return cleanShop
}

export const updateShop = async (
  id: number,
  name: string,
  areaId: number,
  prefectureId: number,
  cityId: number,
  address: string,
  phoneNumber: string,
): Promise<Shop> => {
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
}

export const deleteShop = async (id: number): Promise<Shop> => {
  const shop = await prisma.shop.delete({
    where: { id },
    include: {
      shopDetail: true, area: true, prefecture: true, city: true,
    },
  })
  const cleanShop = reconstructShop(shop)
  return cleanShop
}

export const fetchValidShopIds = async (shopIds: number[]): Promise<number[]> => {
  const validShopIds = await prisma.shop.findMany({
    where: { id: { in: shopIds } },
    select: { id: true },
  })
  return validShopIds.map(obj => obj.id)
}

export const ShopRepository: CommonRepositoryInterface<Shop> & ShopServiceSocket & StylistServiceSocket = {
  fetchAll,
  totalCount,
  fetch,
  insertShop,
  updateShop,
  deleteShop,
  fetchValidShopIds,
}
