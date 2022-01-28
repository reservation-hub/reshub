import ShopService from '@client/shop/services/ShopService'
import { Shop } from '@entities/Shop'
import { UserForAuth } from '@entities/User'
import { OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Stylist } from '@entities/Stylist'
import MenuService from '@client/shop/services/MenuService'
import StylistService from '@client/shop/services/StylistService'
import { ShopControllerInterface } from '@controller-adapter/client/Shop'
import { indexSchema, searchByAreaSchema, searchByTagsSchema } from './schemas'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: UserForAuth | undefined, page?: number, order?: OrderBy)
    : Promise<{ shops: Shop[], totalCount: number }>
  fetchShop(user: UserForAuth | undefined, shopId: number): Promise<Shop>
  fetchShopsByAreaWithTotalCount(user: UserForAuth | undefined, areaId: number, page?: number, order?: OrderBy,
    prefectureId?: number, cityId?: number): Promise<{ shops: Shop[], totalCount:number }>
  fetchShopsByTagsWithTotalCount(user: UserForAuth | undefined, tags: string[], page?: number,
    order?: OrderBy,): Promise<{ shops: Shop[], totalCount:number }>
}

export type MenuServiceInterface = {
  fetchShopMenus(shopId: number): Promise<Menu[]>
}

export type StylistServiceInterface = {
  fetchShopStylists(shopId: number): Promise<Stylist[]>
}

const ShopController: ShopControllerInterface = {
  async index(user, query) {
    const { page, order } = await indexSchema.parseAsync(query)
    const { shops, totalCount } = await ShopService.fetchShopsWithTotalCount(user, page, order)
    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
    }))
    return { values, totalCount }
  },

  async detail(user, query) {
    const { shopId } = query
    const shop = await ShopService.fetchShop(user, shopId)
    const menus = await MenuService.fetchShopMenus(shopId)
    const stylists = await StylistService.fetchShopStylists(shopId)
    return {
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
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
    }
  },

  async searchByArea(user, query) {
    const {
      page, order, areaId, prefectureId, cityId,
    } = await searchByAreaSchema.parseAsync(query)

    const { shops, totalCount } = await ShopService.fetchShopsByAreaWithTotalCount(
      user, areaId, page, order, prefectureId, cityId,
    )

    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
    }))
    return { values, totalCount }
  },

  async searchByTags(user, query) {
    const {
      tags, page, order,
    } = await searchByTagsSchema.parseAsync(query)

    const { shops, totalCount } = await ShopService.fetchShopsByTagsWithTotalCount(
      user, tags, page, order,
    )

    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
    }))
    return { values, totalCount }
  },
}

export default ShopController
