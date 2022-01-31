import { OrderBy, ScheduleDays as EntityScheduleDays } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import { UserForAuth } from '@entities/User'
import StylistService from '@client/stylist/services/StylistService'
import { StylistControllerInterface } from '@controller-adapter/client/Shop'
import { ScheduleDays } from '@request-response-types/models/Common'
import { indexSchema } from './schemas'

export type StylistServiceInterface = {
  fetchShopStylistsWithTotalCount(user: UserForAuth | undefined, shopId: number,
    page?: number, order?: OrderBy, take?: number): Promise<{ stylists: Stylist[], totalCount: number }>
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

const StylistController: StylistControllerInterface = {
  async list(user, query) {
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { stylists, totalCount } = await StylistService.fetchShopStylistsWithTotalCount(
      user, shopId, page, order, take,
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
    const { stylists, totalCount } = await StylistService.fetchShopStylistsWithTotalCount(user, shopId, page, order)
    const values = stylists.map(s => ({
      id: s.id,
      shopId: s.shopId,
      name: s.name,
      price: s.price,
      startTime: s.startTime,
      endTime: s.endTime,
      days: s.days.map(convertEntityDaysToOutboundDays),
    }))
    return { values, totalCount }
  },
}

export default StylistController
