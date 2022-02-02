import { Stylist } from '@entities/Stylist'
import ShopRepository from '@client/shop/repositories/ShopRepository'
import { NotFoundError } from '@errors/ServiceErrors'
import StylistRepository from '@client/shop/repositories/StylistRepository'
import { StylistServiceInterface } from '@client/shop/ShopController'

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
      throw new NotFoundError('Shop does not exist')
    }
    return StylistRepository.fetchShopStylists(shopId, limit)
  },
}

export default StylistService
