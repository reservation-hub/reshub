import { Shop } from '@entities/Shop'
import { OrderBy } from '@entities/Common'
import ShopRepository from '@client/shop/repositories/ShopRepository'
import Logger from '@lib/Logger'
import { ShopServiceInterface } from '../ShopController'

export type ShopRepositoryInterface = {
  fetchShops(page: number, order: OrderBy): Promise<Shop[]>
  fetchShopsTotalCount(): Promise<number>
}

const ShopService: ShopServiceInterface = {
  async fetchShopsWithTotalCount(user, page = 1, order = OrderBy.DESC) {
    Logger.info(user)
    const shops = await ShopRepository.fetchShops(page, order)
    const totalCount = await ShopRepository.fetchShopsTotalCount()
    return { shops, totalCount }
  },
}

export default ShopService
