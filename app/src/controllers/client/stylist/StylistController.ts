import { OrderBy } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import { UserForAuth } from '@entities/User'
import StylistService from '@client/stylist/services/StylistService'
import { StylistControllerInterface } from '@/controller-adapter/client/Shop'
import { indexSchema } from './schemas'

export type StylistServiceInterface = {
  fetchShopStylistsWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: OrderBy)
    :Promise<{ stylists: Stylist[], totalCount: number }>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const StylistController: StylistControllerInterface = {
  async list(user, query) {
    const { shopId } = query
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { stylists, totalCount } = await StylistService.fetchShopStylistsWithTotalCount(user, shopId, page, order)
    const values = stylists.map(s => ({
      id: s.id,
      shopId: s.shopId,
      name: s.name,
      price: s.price,
    }))
    return { values, totalCount }
  },
}

export default StylistController
