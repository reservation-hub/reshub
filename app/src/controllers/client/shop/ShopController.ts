import { OrderBy, ScheduleDays as EntityScheduleDays } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { Tag } from '@entities/Tag'
import { UserForAuth } from '@entities/User'
import { ScheduleDays } from '@request-response-types/models/Common'
import { ShopControllerInterface } from '@controller-adapter/client/Shop'
import MenuService from '@client/shop/services/MenuService'
import ShopService from '@client/shop/services/ShopService'
import StylistService from '@client/shop/services/StylistService'
import TagService from '@client/shop/services/TagService'
import {
  indexSchema, searchByAreaSchema, searchByTagsSchema, searchByNameSchema,
} from '@client/shop/schemas'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: UserForAuth | undefined, page?: number, order?: OrderBy, take?: number)
    : Promise<{ shops: Shop[], totalCount: number }>
  fetchShop(user: UserForAuth | undefined, shopId: number): Promise<Shop>
  fetchShopsByAreaWithTotalCount(user: UserForAuth | undefined, areaId: number, page?: number, order?: OrderBy,
    take?: number, prefectureId?: number, cityId?: number): Promise<{ shops: Shop[], totalCount:number }>
  fetchShopsByTagsWithTotalCount(user: UserForAuth | undefined, tags: string[], page?: number,
    order?: OrderBy, take?: number): Promise<{ shops: Shop[], totalCount:number }>
  fetchShopsByNameWithTotalCount(user: UserForAuth | undefined, name: string, page?: number,
    order?: OrderBy, take?: number): Promise<{ shops: Shop[], totalCount:number }>
}

export type MenuServiceInterface = {
  fetchShopMenus(shopId: number): Promise<Menu[]>
  fetchShopAverageMenuPriceByShopIds(shopIds: number[]): Promise<{ shopId: number, price: number }[]>
}

export type StylistServiceInterface = {
  fetchShopStylists(shopId: number): Promise<Stylist[]>
}

export type TagServiceInterface = {
  fetchShopsTags(shopIds: number[]): Promise<{ shopId: number, tags: Tag[]}[]>
}

const convertEntityDaysToOutboundDays = (day: EntityScheduleDays): ScheduleDays => {
  switch (day) {
    case EntityScheduleDays.SUNDAY:
      return ScheduleDays.SUNDAY
    case EntityScheduleDays.MONDAY:
      return ScheduleDays.MONDAY
    case EntityScheduleDays.TUESDAY:
      return ScheduleDays.TUESDAY
    case EntityScheduleDays.WEDNESDAY:
      return ScheduleDays.WEDNESDAY
    case EntityScheduleDays.THURSDAY:
      return ScheduleDays.THURSDAY
    case EntityScheduleDays.FRIDAY:
      return ScheduleDays.FRIDAY
    default:
      return ScheduleDays.SATURDAY
  }
}

const ShopController: ShopControllerInterface = {
  async index(user, query) {
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { shops, totalCount } = await ShopService.fetchShopsWithTotalCount(user, page, order, take)
    const shopIds = shops.map(s => s.id)
    const shopMenuAveragePrices = await MenuService.fetchShopAverageMenuPriceByShopIds(shopIds)
    const shopTags = await TagService.fetchShopsTags(shopIds)
    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
      startTime: s.startTime,
      endTime: s.endTime,
      averageMenuPrice: shopMenuAveragePrices.find(smap => smap.shopId === s.id)!.price,
      tags: shopTags.find(st => st.shopId === s.id)?.tags,
    }))
    return { values, totalCount }
  },

  async detail(user, query) {
    const { shopId } = query
    const shop = await ShopService.fetchShop(user, shopId)
    const menus = await MenuService.fetchShopMenus(shopId)
    const stylists = await StylistService.fetchShopStylists(shopId)
    const shopTags = await TagService.fetchShopsTags([shop.id])
    return {
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      startTime: shop.startTime,
      endTime: shop.endTime,
      seats: shop.seats,
      details: shop.details,
      days: shop.days.map(convertEntityDaysToOutboundDays),
      menus: menus.map(m => ({
        id: m.id,
        shopId: m.shopId,
        name: m.name,
        price: m.price,
        duration: m.duration,
      })),
      stylists: stylists.map(s => ({
        id: s.id,
        shopId: s.shopId,
        name: s.name,
        price: s.price,

      })),
      tags: shopTags.find(st => st.shopId === shop.id)?.tags,
    }
  },

  async searchByArea(user, query) {
    const {
      page, order, areaId, prefectureId, cityId, take,
    } = await searchByAreaSchema.parseAsync(query)

    const { shops, totalCount } = await ShopService.fetchShopsByAreaWithTotalCount(
      user, areaId, page, order, prefectureId, cityId, take,
    )
    const shopMenuAveragePrices = await MenuService.fetchShopAverageMenuPriceByShopIds(shops.map(s => s.id))

    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
      startTime: s.startTime,
      endTime: s.endTime,
      averageMenuPrice: shopMenuAveragePrices.find(smap => smap.shopId === s.id)!.price,
    }))
    return { values, totalCount }
  },

  async searchByTags(user, query) {
    const {
      tags, page, order, take,
    } = await searchByTagsSchema.parseAsync(query)

    const { shops, totalCount } = await ShopService.fetchShopsByTagsWithTotalCount(
      user, tags, page, order, take,
    )
    const shopMenuAveragePrices = await MenuService.fetchShopAverageMenuPriceByShopIds(shops.map(s => s.id))

    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
      startTime: s.startTime,
      endTime: s.endTime,
      averageMenuPrice: shopMenuAveragePrices.find(smap => smap.shopId === s.id)!.price,
    }))
    return { values, totalCount }
  },

  async searchByName(user, query) {
    const {
      name, page, order, take,
    } = await searchByNameSchema.parseAsync(query)
    const { shops, totalCount } = await ShopService.fetchShopsByNameWithTotalCount(
      user, name, page, order, take,
    )
    const shopMenuAveragePrices = await MenuService.fetchShopAverageMenuPriceByShopIds(shops.map(s => s.id))

    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
      startTime: s.startTime,
      endTime: s.endTime,
      averageMenuPrice: shopMenuAveragePrices.find(smap => smap.shopId === s.id)!.price,
    }))
    return { values, totalCount }
  },
}

export default ShopController
