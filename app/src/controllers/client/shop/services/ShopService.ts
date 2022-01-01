import { Shop } from '@entities/Shop'
import { OrderBy } from '@entities/Common'
import ShopRepository from '@client/shop/repositories/ShopRepository'
import { ShopServiceInterface } from '../ShopController'
import Logger from '@/lib/Logger'
import { NotFoundError } from './ServiceError'

export type ShopRepositoryInterface = {
  fetchShops(page: number, order: OrderBy): Promise<Shop[]>
  fetchShopsTotalCount(): Promise<number>
  fetchShop(shopId: number): Promise<Shop | null>
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

}

export default ShopService
