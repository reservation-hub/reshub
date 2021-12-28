import { UserForAuth } from '@entities/User'
import { Stylist } from '@entities/Stylist'
import { OrderBy } from '@request-response-types/Common'
import { indexSchema, shopStylistUpsertSchema } from '@stylist/schemas'
import StylistService from '@stylist/services/StylistService'
import ShopService from '@stylist/services/ShopService'
import { StylistControllerInterface } from '@controller-adapter/Shop'
import { ScheduleDays } from '@request-response-types/models/Common'

export type StylistServiceInterface = {
  fetchShopStylistsWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: OrderBy)
    : Promise<{ stylists: Stylist[], totalCount: number }>
  fetchStylist(user: UserForAuth, shopId: number, stylistId: number): Promise<Stylist>
  insertStylist(user: UserForAuth, shopId: number, name: string, price: number,
    days:ScheduleDays[], startTime:string, endTime:string)
    : Promise<Stylist>
  updateStylist(user: UserForAuth, shopId: number, stylistId: number, name: string, price: number,
    days: ScheduleDays[], startTime: string, endTime: string)
    : Promise<Stylist>
  deleteStylist(user: UserForAuth, shopId: number, stylistId: number)
    : Promise<Stylist>
  fetchStylistsReservationCounts(stylistIds: number[]): Promise<{ stylistId: number, reservationCount: number }[]>
}

export type ShopServiceInterface = {
  fetchShopName(user: UserForAuth, shopId: number): Promise<string>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const StylistController: StylistControllerInterface = {
  async index(user, query) {
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { shopId } = query
    const { stylists, totalCount } = await StylistService.fetchShopStylistsWithTotalCount(user, shopId, page, order)
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
    const { shopId, stylistId } = query
    const stylist = await StylistService.fetchStylist(user, shopId, stylistId)
    const shopName = await ShopService.fetchShopName(user, shopId)
    return { ...stylist, shopName }
  },

  async insert(user, query) {
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    await StylistService.insertStylist(user, shopId, name, price, days, startTime, endTime)
    return 'Stylist created'
  },

  async update(user, query) {
    const {
      name, price, days, startTime, endTime,
    } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, stylistId } = query
    await StylistService.updateStylist(user, shopId, stylistId, name, price, days, startTime, endTime)
    return 'Stylist updated'
  },

  async delete(user, query) {
    const { shopId, stylistId } = query
    await StylistService.deleteStylist(user, shopId, stylistId)
    return 'Stylist deleted'
  },
}

export default StylistController
