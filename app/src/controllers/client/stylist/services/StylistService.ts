import { OrderBy } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import { StylistServiceInterface } from '@client/stylist/StylistController'
import StylistRepository from '@client/stylist/repositories/StylistRepository'

export type StylistRepositoryInterface = {
  fetchShopStylists(shopId: number, page: number, order: OrderBy): Promise<Stylist[]>
  fetchShopStylistTotalCount(shopId: number): Promise<number>
}

const StylistService: StylistServiceInterface = {
  async fetchShopStylistsWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC) {
    const stylists = await StylistRepository.fetchShopStylists(shopId, page, order)
    const totalCount = await StylistRepository.fetchShopStylistTotalCount(shopId)
    return { stylists, totalCount }
  },
}

export default StylistService
