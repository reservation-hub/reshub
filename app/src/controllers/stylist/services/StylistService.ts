import { OrderBy, ScheduleDays } from '@entities/Common'
import { RoleSlug } from '@entities/Role'
import { Stylist } from '@entities/Stylist'
import { StylistServiceInterface } from '@stylist/StylistController'
import { AuthorizationError, InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import ShopRepository from '@stylist/repositories/ShopRepository'
import StylistRepository from '@stylist/repositories/StylistRepository'
import isWithinSchedule, { convertToDate } from '@lib/ScheduleChecker'

export type StylistRepositoryInterface = {
  fetchShopStylists(shopId: number, page: number, order: OrderBy, take: number): Promise<Stylist[]>
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
  fetchUserShopSchedule(userId: number, shopId: number)
    : Promise<{ startTime: string, endTime: string, days: ScheduleDays[]} | null>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const StylistService: StylistServiceInterface = {
  async fetchShopStylistsWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC, take = 10) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const stylists = await StylistRepository.fetchShopStylists(shopId, page, order, take)
    const totalCount = await StylistRepository.fetchShopTotalStylistsCount(shopId)
    return { stylists, totalCount }
  },

  async fetchStylist(user, shopId, stylistId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
    if (!stylist) {
      throw new NotFoundError('stylist not found')
    }

    return stylist
  },

  async insertStylist(user, shopId, name, price, days, startTime, endTime) {
    const shopSchedule = await ShopRepository.fetchUserShopSchedule(user.id, shopId)
    if (!shopSchedule) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const providedScheduleIsWithinShopSchedule = isWithinSchedule(
      shopSchedule.startTime, shopSchedule.endTime, shopSchedule.days,
      convertToDate(startTime), convertToDate(endTime), days,
    )

    if (!providedScheduleIsWithinShopSchedule) {
      throw new InvalidParamsError('Stylist schedule does not match shop schedule')
    }

    const stylist = await StylistRepository.insertStylist(name, price, shopId, days, startTime, endTime)
    return stylist
  },

  async updateStylist(user, shopId, stylistId, name, price, days, startTime, endTime) {
    const shopSchedule = await ShopRepository.fetchUserShopSchedule(user.id, shopId)
    if (!shopSchedule) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
    if (!stylist) {
      throw new NotFoundError('stylist not found')
    }

    const providedScheduleIsWithinShopSchedule = isWithinSchedule(
      shopSchedule.startTime, shopSchedule.endTime, shopSchedule.days,
      convertToDate(startTime), convertToDate(endTime), days,
    )

    if (!providedScheduleIsWithinShopSchedule) {
      throw new InvalidParamsError(`Stylist schedule ${startTime} - ${endTime}
       does not match shop schedule ${shopSchedule.startTime} - ${shopSchedule.endTime}`)
    }

    return StylistRepository.updateStylist(stylistId, name, price, shopId, days, startTime, endTime)
  },

  async deleteStylist(user, shopId, stylistId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
    if (!stylist) {
      throw new NotFoundError('stylist not found')
    }

    return StylistRepository.deleteStylist(stylistId)
  },

  async fetchStylistsReservationCounts(stylistIds) {
    const counts = await StylistRepository.fetchStylistsReservationCounts(stylistIds)
    return stylistIds.map(id => ({
      stylistId: id,
      reservationCount: counts.find(c => c.stylistId === id)?.reservationCount ?? 0,
    }))
  },

}

export default StylistService
