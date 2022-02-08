import { OrderBy } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import { UserForAuth } from '@entities/User'
import StylistService from '@client/stylist/services/StylistService'
import { StylistControllerInterface } from '@controller-adapter/client/Shop'
import { convertEntityDaysToDTO, convertOrderByToEntity } from '@dtoConverters/Common'
import { indexSchema } from './schemas'

export type StylistServiceInterface = {
  fetchShopStylistsWithTotalCount(user: UserForAuth | undefined, shopId: number,
    page?: number, order?: OrderBy, take?: number): Promise<{ stylists: Stylist[], totalCount: number }>
}

const StylistController: StylistControllerInterface = {
  async list(user, query) {
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { stylists, totalCount } = await StylistService.fetchShopStylistsWithTotalCount(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const values = stylists.map(s => ({
      id: s.id,
      shopId: s.shopId,
      name: s.name,
      price: s.price,
    }))
    return { values, totalCount }
  },

  async listForReservation(user, query) {
    const { shopId } = query
    const { page, order } = await indexSchema.parseAsync(query)
    const { stylists, totalCount } = await StylistService.fetchShopStylistsWithTotalCount(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
    )
    const values = stylists.map(s => ({
      id: s.id,
      shopId: s.shopId,
      name: s.name,
      price: s.price,
      startTime: s.startTime,
      endTime: s.endTime,
      days: s.days.map(convertEntityDaysToDTO),
    }))
    return { values, totalCount }
  },
}

export default StylistController
