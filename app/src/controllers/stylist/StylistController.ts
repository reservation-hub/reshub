import { UserForAuth } from '@entities/User'
import { Stylist as EntityStylist } from '@entities/Stylist'
import { Stylist } from '@request-response-types/models/Stylist'
import { indexSchema, shopStylistUpsertSchema } from '@stylist/schemas'
import StylistService from '@stylist/services/StylistService'
import ShopService from '@stylist/services/ShopService'
import { StylistControllerInterface } from '@controller-adapter/Shop'
import { ScheduleDays } from '@request-response-types/models/Common'
import { ScheduleDays as EntityScheduleDays, OrderBy as EntityOrderBy } from '@entities/Common'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { convertDTODaysToEntity, convertEntityDaysToDTO, convertOrderByToEntity } from '@dtoConverters/Common'

export type StylistServiceInterface = {
  fetchShopStylistsWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: EntityOrderBy,
    take?: number): Promise<{ stylists: EntityStylist[], totalCount: number }>
  fetchStylist(user: UserForAuth, shopId: number, stylistId: number): Promise<EntityStylist>
  insertStylist(user: UserForAuth, shopId: number, name: string, price: number,
    days:EntityScheduleDays[], startTime:string, endTime:string)
    : Promise<EntityStylist>
  updateStylist(user: UserForAuth, shopId: number, stylistId: number, name: string, price: number,
    days: EntityScheduleDays[], startTime: string, endTime: string)
    : Promise<EntityStylist>
  deleteStylist(user: UserForAuth, shopId: number, stylistId: number)
    : Promise<EntityStylist>
  fetchStylistsReservationCounts(stylistIds: number[]): Promise<{ stylistId: number, reservationCount: number }[]>
}

export type ShopServiceInterface = {
  fetchShopName(user: UserForAuth, shopId: number): Promise<string>
}

const recreateStylist = async (s: EntityStylist, user: UserForAuth, shopId: number): Promise<Stylist> => {
  const shopName = await ShopService.fetchShopName(user, shopId)
  const stylistReservationCount = (
    await StylistService.fetchStylistsReservationCounts([s.id]))[0].reservationCount
  return {
    ...s,
    startTime: s.startTime,
    endTime: s.endTime,
    days: s.days.map(convertEntityDaysToDTO),
    shopName,
    reservationCount: stylistReservationCount,
  }
}

const StylistController: StylistControllerInterface = {
  async index(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { shopId } = query
    const { stylists, totalCount } = await StylistService.fetchShopStylistsWithTotalCount(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const stylistReservationCounts = await StylistService.fetchStylistsReservationCounts(stylists.map(s => s.id))
    const stylistList = stylists.map(s => ({
      id: s.id,
      shopId: s.shopId,
      name: s.name,
      price: s.price,
      reservationCount: stylistReservationCounts.find(src => src.stylistId === s.id)?.reservationCount ?? 0,
    }))
    return { values: stylistList, totalCount }
  },

  async show(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, stylistId } = query
    const stylist = await StylistService.fetchStylist(user, shopId, stylistId)
    return recreateStylist(stylist, user, shopId)
  },

  async insert(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.parseAsync(query.params)
    const { shopId } = query
    const entityDays = days.map((d: ScheduleDays) => convertDTODaysToEntity(d))
    const stylist = await StylistService.insertStylist(user, shopId, name, price, entityDays, startTime, endTime)
    return recreateStylist(stylist, user, shopId)
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.parseAsync(query.params)
    const { shopId, stylistId } = query
    const entityDays = days.map((d: ScheduleDays) => convertDTODaysToEntity(d))
    const stylist = await StylistService.updateStylist(user, shopId, stylistId, name, price, entityDays,
      startTime, endTime)
    return recreateStylist(stylist, user, shopId)
  },

  async delete(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, stylistId } = query
    const stylist = await StylistService.deleteStylist(user, shopId, stylistId)
    return recreateStylist(stylist, user, shopId)
  },
}

export default StylistController
