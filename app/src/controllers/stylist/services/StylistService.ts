import { OrderBy, ScheduleDays } from '@entities/Common'
import { RoleSlug } from '@entities/Role'
import { Stylist } from '@entities/Stylist'
import { StylistServiceInterface } from '@stylist/StylistController'
import { AuthorizationError, NotFoundError } from '@stylist/services/ServiceError'
import ShopRepository from '@stylist/repositories/ShopRepository'
import StylistRepository from '@stylist/repositories/StylistRepository'

export type StylistRepositoryInterface = {
  fetchShopStylists(shopId: number, page: number, order: OrderBy): Promise<Stylist[]>
  fetchShopTotalStylistsCount(shopId: number): Promise<number>
  fetchShopStylist(shopId: number, stylistId: number): Promise<Stylist | null>
  insertStylist(name: string, price: number, shopId: number, days:ScheduleDays[],
    startTime:string, endTime:string): Promise<Stylist>
  updateStylist(id: number, name: string, price: number, shopId: number,
    days: ScheduleDays[], startTime: string, endTime: string) :Promise<Stylist>
  deleteStylist(id: number): Promise<Stylist>
  fetchStylistsReservationCounts(stylistIds: number[]): Promise<{ stylistId: number, reservationCount: number }[]>
}

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  const result = userShopIds.some(id => id === shopId)
  return result
}

const StylistService: StylistServiceInterface = {
  async fetchShopStylistsWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylists = await StylistRepository.fetchShopStylists(shopId, page, order)
    const totalCount = await StylistRepository.fetchShopTotalStylistsCount(shopId)
    return { stylists, totalCount }
  },

  async fetchStylist(user, shopId, stylistId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return stylist
  },

  async insertStylist(user, shopId, name, price, days, startTime, endTime) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylist = await StylistRepository.insertStylist(name, price, shopId, days, startTime, endTime)
    return stylist
  },

  async updateStylist(user, shopId, stylistId, name, price, days, startTime, endTime) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.updateStylist(stylistId, name, price, shopId, days, startTime, endTime)
  },

  async deleteStylist(user, shopId, stylistId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.deleteStylist(stylistId)
  },

  async fetchStylistsReservationCounts(stylistIds) {
    return StylistRepository.fetchStylistsReservationCounts(stylistIds)
  },

}

export default StylistService
