import { ShopServiceInterface } from '@shop/ShopController'
import { ScheduleDays, OrderBy } from '@entities/Common'
import { RoleSlug } from '@entities/Role'
import { Shop } from '@entities/Shop'
import { User } from '@entities/User'
import ShopRepository from '@shop/repositories/ShopRepository'
import LocationRepository from '@shop/repositories/LocationRepository'
import { AuthorizationError, InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import { convertToUnixTime } from '@lib/ScheduleChecker'

export type ShopRepositoryInterface = {
  fetchAllShops(page: number, order: OrderBy, take: number): Promise<Shop[]>
  fetchShop(shopId: number): Promise<Shop | null>
  totalCount(): Promise<number>
  insertShop(
    name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: ScheduleDays[], seats:number, startTime: string, endTime: string, details: string)
    : Promise<Shop>
  updateShop(
    id: number, name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: ScheduleDays[], seats:number,
    startTime: string, endTime: string, details: string) : Promise<Shop>
  deleteShop(id: number): Promise<Shop>
  searchShops(keyword: string, page: number, order: OrderBy, take: number): Promise<Shop[]>
  searchShopsTotalCount(keyword: string): Promise<number>
  staffShopSearchTotalCount(keyword: string, userId: number): Promise<number>
  fetchStaffShops(userId: number, page: number, order: OrderBy, take: number): Promise<Shop[]>
  fetchStaffTotalShopsCount(userId: number): Promise<number>
  fetchUserShopIds(userId: number): Promise<number[]>
  assignShopToStaff(userId: number, shopId: number): void
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>
}

export type UserRepositoryInterface = {
  fetchUser(userId: number): Promise<User | null>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

export const ShopService: ShopServiceInterface = {

  async fetchShopsWithTotalCount(user, page = 1, order = OrderBy.DESC, take = 10) {
    let shops
    let shopsCount
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      shops = await ShopRepository.fetchStaffShops(user.id, page, order, take)
      shopsCount = await ShopRepository.fetchStaffTotalShopsCount(user.id)
    } else {
      shops = await ShopRepository.fetchAllShops(page, order, take)
      shopsCount = await ShopRepository.totalCount()
    }
    return { shops, totalCount: shopsCount }
  },

  async fetchShop(user, id) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, id)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const shop = await ShopRepository.fetchShop(id)
    if (!shop) {
      throw new NotFoundError(`Shop ${id} does not exist`)
    }
    return shop
  },

  async insertShop(user, name, areaId, prefectureId, cityId, address, phoneNumber,
    days, seats, startTime, endTime, details) {
    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      throw new InvalidParamsError('Location provided is incorrect')
    }

    const startHour = convertToUnixTime(startTime)
    const endHour = convertToUnixTime(endTime)
    if (endHour <= startHour) {
      throw new InvalidParamsError('End time is less than or equal to start hour')
    }

    const uniqueDays: ScheduleDays[] = days.filter((n, i) => days.indexOf(n) === i)

    const shop = await ShopRepository.insertShop(
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, seats, startTime, endTime, details,
    )
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      await ShopRepository.assignShopToStaff(user.id, shop.id)
    }
    return shop
  },

  async updateShop(user, id, name, areaId, prefectureId, cityId, address,
    phoneNumber, days, seats, startTime, endTime, details) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, id)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      throw new InvalidParamsError('Location provided is incorrect')
    }

    const shop = await ShopRepository.fetchShop(id)
    if (!shop) {
      throw new NotFoundError(`Shop ${id} does not exist`)
    }

    const startHour = convertToUnixTime(startTime)
    const endHour = convertToUnixTime(endTime)
    if (endHour <= startHour) {
      throw new InvalidParamsError('End time is less than or equal to start hour')
    }

    const uniqueDays: ScheduleDays[] = days.filter((n, i) => days.indexOf(n) === i)

    return ShopRepository.updateShop(
      id,
      name, areaId, prefectureId, cityId, address,
      phoneNumber, uniqueDays, seats, startTime, endTime, details,
    )
  },

  async deleteShop(user, id) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, id)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const shop = await ShopRepository.fetchShop(id)
    if (!shop) {
      throw new NotFoundError(`Shop ${id} does not exist`)
    }
    return ShopRepository.deleteShop(id)
  },

  async searchShops(user, keyword, page = 1, order = OrderBy.DESC, take = 10) {
    let shops: Shop[]
    shops = await ShopRepository.searchShops(keyword, page, order, take)
    let totalCount: number
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      const userShopIds = await ShopRepository.fetchUserShopIds(user.id)
      shops = shops.filter(s => userShopIds.some(usid => usid === s.id))

      totalCount = await ShopRepository.staffShopSearchTotalCount(keyword, user.id)
    } else {
      totalCount = await ShopRepository.searchShopsTotalCount(keyword)
    }

    return { shops, totalCount }
  },

}

export default ShopService
