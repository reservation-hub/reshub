import { Stylist } from '@entities/Stylist'
import ShopRepository from '@client/shop/repositories/ShopRepository'
import Logger from '@lib/Logger'
import { StylistServiceInterface } from '../ShopController'
import { NotFoundError } from './ServiceError'
import StylistRepository from '../repositories/StylistRepository'

export type ShopRepositoryInterface = {
  shopExists(shopId: number): Promise<boolean>
}

export type StylistRepositoryInterface = {
  fetchShopStylists(shopId: number, limit: number): Promise<Stylist[]>
}

const StylistService: StylistServiceInterface = {
  async fetchShopStylists(shopId) {
    const limit = 5
    const shopExists = await ShopRepository.shopExists(shopId)
    if (!shopExists) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }
    return StylistRepository.fetchShopStylists(shopId, limit)
  },
}

export default StylistService