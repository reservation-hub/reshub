import { OrderBy } from '@request-response-types/client/Common'
import { OrderBy as EntityOrderBy, ScheduleDays as EntityScheduleDays } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { Tag } from '@entities/Tag'
import { UserForAuth } from '@entities/User'
import { Review } from '@entities/Review'
import { ScheduleDays } from '@request-response-types/models/Common'
import { ShopControllerInterface } from '@controller-adapter/client/Shop'
import MenuService from '@client/shop/services/MenuService'
import ShopService from '@client/shop/services/ShopService'
import StylistService from '@client/shop/services/StylistService'
import TagService from '@client/shop/services/TagService'
import ReviewService from '@client/shop/services/ReviewService'
import {
  indexSchema, searchByAreaSchema, searchByTagsSchema, searchByNameSchema,
} from '@client/shop/schemas'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: UserForAuth | undefined, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ shops: Shop[], totalCount: number }>
  fetchShop(user: UserForAuth | undefined, shopId: number): Promise<Shop>
  fetchShopsByAreaWithTotalCount(user: UserForAuth | undefined, areaId: number, page?: number, order?: EntityOrderBy,
    take?: number, prefectureId?: number, cityId?: number): Promise<{ shops: Shop[], totalCount:number }>
  fetchShopsByTagsWithTotalCount(user: UserForAuth | undefined, tags: string[], page?: number,
    order?: EntityOrderBy, take?: number): Promise<{ shops: Shop[], totalCount:number }>
  fetchShopsByNameWithTotalCount(user: UserForAuth | undefined, name: string, page?: number,
    order?: EntityOrderBy, take?: number): Promise<{ shops: Shop[], totalCount:number }>
  fetchPopularShops(user: UserForAuth | undefined): Promise<(Shop & { ranking: number })[]>
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

export type ReviewServiceInterface = {
  fetchShopReviewsWithClientName(shopId: number): Promise<(Review & { clientName: string })[]>
  fetchShopsReviewsCount(shopIds: number[]): Promise<{ shopId: number, reviewCount: number }[]>
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

const convertOrderByToEntity = (order: OrderBy): EntityOrderBy => {
  switch (order) {
    case OrderBy.ASC:
      return EntityOrderBy.ASC
    default:
      return EntityOrderBy.DESC
  }
}

const reconstructShops = async (shops: Shop[]) => {
  const shopIds = shops.map(s => s.id)
  const shopMenuAveragePrices = await MenuService.fetchShopAverageMenuPriceByShopIds(shopIds)
  const shopTags = await TagService.fetchShopsTags(shopIds)
  const reviewCounts = await ReviewService.fetchShopsReviewsCount(shopIds)
  return shops.map(s => ({
    id: s.id,
    name: s.name,
    phoneNumber: s.phoneNumber,
    address: s.address,
    prefectureName: s.prefecture.name,
    cityName: s.city.name,
    startTime: s.startTime,
    endTime: s.endTime,
    averageMenuPrice: shopMenuAveragePrices.find(smap => smap.shopId === s.id)!.price,
    tags: shopTags.find(st => st.shopId === s.id)?.tags.map(t => ({ slug: t.slug })),
    reviewsCount: reviewCounts.find(rc => rc.shopId === s.id)!.reviewCount,
  }))
}

const ShopController: ShopControllerInterface = {
  async index(user, query) {
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { shops, totalCount } = await ShopService.fetchShopsWithTotalCount(
      user,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const values = await reconstructShops(shops)
    return { values, totalCount }
  },

  async detail(user, query) {
    const { shopId } = query
    const shop = await ShopService.fetchShop(user, shopId)
    const menus = await MenuService.fetchShopMenus(shop.id)
    const stylists = await StylistService.fetchShopStylists(shop.id)
    const shopTags = await TagService.fetchShopsTags([shop.id])
    const reviews = await ReviewService.fetchShopReviewsWithClientName(shop.id)
    const reviewCounts = await ReviewService.fetchShopsReviewsCount([shop.id])
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
      tags: shopTags.find(st => st.shopId === shop.id)?.tags.map(t => ({ slug: t.slug })),
      reviews: reviews.map(r => ({
        ...r,
        shopName: shop.name,
      })),
      reviewsCount: reviewCounts.find(rc => rc.shopId === shop.id)!.reviewCount,
    }
  },

  async searchByArea(user, query) {
    const {
      page, order, areaId, prefectureId, cityId, take,
    } = await searchByAreaSchema.parseAsync(query)

    const { shops, totalCount } = await ShopService.fetchShopsByAreaWithTotalCount(
      user,
      areaId,
      page,
      order ? convertOrderByToEntity(order) : order,
      prefectureId,
      cityId,
      take,
    )
    const values = await reconstructShops(shops)
    return { values, totalCount }
  },

  async searchByTags(user, query) {
    const {
      tags, page, order, take,
    } = await searchByTagsSchema.parseAsync(query)

    const { shops, totalCount } = await ShopService.fetchShopsByTagsWithTotalCount(
      user,
      tags,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const values = await reconstructShops(shops)
    return { values, totalCount }
  },

  async searchByName(user, query) {
    const {
      name, page, order, take,
    } = await searchByNameSchema.parseAsync(query)
    const { shops, totalCount } = await ShopService.fetchShopsByNameWithTotalCount(
      user,
      name,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const values = await reconstructShops(shops)
    return { values, totalCount }
  },

  async fetchPopularShops(user) {
    const shopsWithRanking = await ShopService.fetchPopularShops(user)
    const cleanShops = await reconstructShops(shopsWithRanking)
    return cleanShops.map(cs => ({
      ...cs,
      ranking: shopsWithRanking.find(swr => cs.id === swr.id)!.ranking,
    }))
  },
}

export default ShopController
