import { Shop } from '@entities/Shop'
import { OrderBy } from '@entities/Common'
import ShopRepository from '@client/shop/repositories/ShopRepository'
import Logger from '@lib/Logger'
import { InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import { ShopServiceInterface } from '@client/shop/ShopController'
import LocationRepository from '@client/shop/repositories/LocationRepository'

export type ShopRepositoryInterface = {
  fetchShops(page: number, order: OrderBy): Promise<Shop[]>
  fetchShopsTotalCount(): Promise<number>
  fetchShop(shopId: number): Promise<Shop | null>
  fetchShopsByArea(page:number, order: OrderBy, areaId: number, prefectureId?: number, cityId?: number): Promise<Shop[]>
  fetchShopsTotalCountByArea(areaId: number, prefectureId?: number, cityId?: number): Promise<number>
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId?: number, cityId?: number): Promise<boolean>
}

const ShopService: ShopServiceInterface = {
  async fetchShopsWithTotalCount(user, page = 1, order = OrderBy.DESC) {
    const shops = await ShopRepository.fetchShops(page, order)
    const totalCount = await ShopRepository.fetchShopsTotalCount()
    return { shops, totalCount }
  },

  async fetchShop(user, shopId) {
    const shop = await ShopRepository.fetchShop(shopId)
    if (!shop) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }
    return shop
  },

  async fetchShopsByAreaWithTotalCount(user, areaId, page = 1, order = OrderBy.DESC, prefectureId,
    cityId) {
    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      Logger.debug('Location provided is incorrect')
      throw new InvalidParamsError()
    }

    const shops = await ShopRepository.fetchShopsByArea(page, order, areaId, prefectureId, cityId)
    const totalCount = await ShopRepository.fetchShopsTotalCountByArea(areaId, prefectureId, cityId)
    return { shops, totalCount }
  },

}

export default ShopService
