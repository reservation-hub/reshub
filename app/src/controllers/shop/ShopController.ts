import { convertDateTimeObjectToDateTimeString } from '@lib/Date'
import { Shop as EntityShop } from '@entities/Shop'
import { Shop } from '@request-response-types/models/Shop'
import { Stylist } from '@entities/Stylist'
import { ShopControllerInterface } from '@controller-adapter/Shop'
import { User, UserForAuth } from '@entities/User'
import { Menu } from '@entities/Menu'
import { Reservation, ReservationStatus as EntityReservationStatus } from '@entities/Reservation'
import { ScheduleDays as EntityScheduleDays, OrderBy as EntityOrderBy } from '@entities/Common'
import ShopService from '@shop/services/ShopService'
import UserService from '@shop/services/UserService'
import ReservationService from '@shop/services/ReservationService'
import StylistService from '@shop/services/StylistService'
import MenuService from '@shop/services/MenuService'
import { OrderBy } from '@request-response-types/Common'
import { ReservationStatus } from '@request-response-types/models/Reservation'
import { ScheduleDays } from '@request-response-types/models/Common'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { Tag } from '@entities/Tag'
import { Review } from '@entities/Review'
import TagService from '@shop/services/TagService'
import ReviewService from '@shop/services/ReviewService'
import { shopUpsertSchema, indexSchema, searchSchema } from './schemas'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: UserForAuth, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ shops: EntityShop[], totalCount: number }>
  fetchShop(user: UserForAuth, id: number): Promise<EntityShop>
  insertShop(user: UserForAuth, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: EntityScheduleDays[],
    seats: number, startTime: string, endTime: string, details: string): Promise<EntityShop>
  updateShop(user: UserForAuth, id: number, name: string, areaId: number, prefectureId: number,
    cityId: number, address: string, phoneNumber: string, days: EntityScheduleDays[],
    seats:number, startTime: string, endTime: string, details: string): Promise<EntityShop>
  deleteShop(user: UserForAuth, id: number): Promise<EntityShop>
  searchShops(user: UserForAuth, keyword: string, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ shops: EntityShop[], totalCount: number }>
}

export type StylistServiceInterface = {
  fetchShopStylistsWithReservationCount(user: UserForAuth, shopId: number, limit?: number)
    : Promise<(Stylist & { reservationCount: number})[]>
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ shopId: number, stylistCount: number }[]>
}

export type ReservationServiceInterface = {
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ shopId: number, reservationCount: number }[]>
  fetchShopReservations(user: UserForAuth, shopId: number, limit?: number): Promise<Reservation[]>
  getTotalSalesForShopForCurrentMonth(shopId: number): Promise<number>
}

export type MenuServiceInterface = {
  fetchShopMenus(user: UserForAuth, shopId: number, limit?: number): Promise<Menu[]>
}

export type UserServiceInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

export type TagServiceInterface = {
  fetchShopTags(shopId: number): Promise<Tag[]>
}

export type ReviewsServiceInterface = {
  fetchReviewsForShop(shopId: number, limit?: number): Promise<Review[]>
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

const convertInboundDaysToEntityDays = (day: ScheduleDays): EntityScheduleDays => {
  switch (day) {
    case ScheduleDays.SUNDAY:
      return EntityScheduleDays.SUNDAY
    case ScheduleDays.MONDAY:
      return EntityScheduleDays.MONDAY
    case ScheduleDays.TUESDAY:
      return EntityScheduleDays.TUESDAY
    case ScheduleDays.WEDNESDAY:
      return EntityScheduleDays.WEDNESDAY
    case ScheduleDays.THURSDAY:
      return EntityScheduleDays.THURSDAY
    case ScheduleDays.FRIDAY:
      return EntityScheduleDays.FRIDAY
    default:
      return EntityScheduleDays.SATURDAY
  }
}

const convertOrderByToEntity = (order: OrderBy): EntityOrderBy => {
  switch (order) {
    case OrderBy.ASC:
      return EntityOrderBy.ASC
    default:
      return EntityOrderBy.DESC
  }
}

const convertStatusToPDO = (status: EntityReservationStatus): ReservationStatus => {
  switch (status) {
    case EntityReservationStatus.CANCELLED:
      return ReservationStatus.CANCELLED
    case EntityReservationStatus.COMPLETED:
      return ReservationStatus.COMPLETED
    default:
      return ReservationStatus.RESERVED
  }
}

const reconstructShop = async (shop: EntityShop, user: UserForAuth, limits: {
  stylistLimit?: number
  reservationLimit?: number
  menuLimit?: number
  reviewLimit?: number
}): Promise<Shop> => {
  const stylists = await StylistService.fetchShopStylistsWithReservationCount(user, shop.id, limits.stylistLimit)
  const reservations = await ReservationService.fetchShopReservations(user, shop.id, limits.reservationLimit)
  const menus = await MenuService.fetchShopMenus(user, shop.id, limits.menuLimit)
  const reviews = await ReviewService.fetchReviewsForShop(shop.id, limits.reviewLimit)
  const users = await UserService.fetchUsersByIds(reservations.map(r => r.clientId))
  const usersForReview = await UserService.fetchUsersByIds(reviews.map(r => r.clientId))
  const totalSalesForCurrentMonth = await ReservationService.getTotalSalesForShopForCurrentMonth(shop.id)
  const shopTags = await TagService.fetchShopTags(shop.id)
  const stylistList = stylists.map(s => ({
    id: s.id,
    shopId: s.shopId,
    name: s.name,
    price: s.price,
    reservationCount: s.reservationCount,
  }))

  const reviewList = reviews.map(rev => {
    const user = usersForReview.find(u => u.id === rev.clientId)!
    return {
      id: rev.id,
      text: rev.text,
      score: rev.score,
      clientId: rev.clientId,
      clientName: `${user.lastNameKana} ${user.firstNameKana}`,
      shopId: rev.shopId,
      shopName: shop.name,
    }
  })
  const reservationList = reservations.map(r => {
    const user = users.find(u => u.id === r.clientId)!
    const stylist = stylists.find(s => s.id === r.stylistId)
    const menu = menus.find(m => m.id === r.menuId)!
    return {
      id: r.id,
      shopId: r.shopId,
      shopName: shop.name,
      clientName: `${user.lastNameKana} ${user.firstNameKana}`,
      stylistName: stylist?.name,
      menuName: menu.name,
      status: convertStatusToPDO(r.status),
      reservationDate: convertDateTimeObjectToDateTimeString(r.reservationDate),
    }
  })

  return {
    id: shop.id,
    areaId: shop.area.id,
    prefectureId: shop.prefecture.id,
    prefectureName: shop.prefecture.name,
    cityId: shop.city.id,
    cityName: shop.city.name,
    days: shop.days.map(convertEntityDaysToOutboundDays),
    seats: shop.seats,
    startTime: shop.startTime,
    endTime: shop.endTime,
    name: shop.name,
    address: shop.address,
    details: shop.details,
    phoneNumber: shop.phoneNumber,
    stylists: stylistList,
    reservations: reservationList,
    menu: menus,
    reservationCount: reservations.length,
    totalSalesForCurrentMonth,
    tags: shopTags,
    reviews: reviewList,
  }
}

const ShopController: ShopControllerInterface = {
  async index(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { shops, totalCount } = await ShopService.fetchShopsWithTotalCount(user,
      page,
      order ? convertOrderByToEntity(order) : order,
      take)

    const shopIds = shops.map(shop => shop.id)

    const totalReservationsCount = await ReservationService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await StylistService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      reservationsCount: totalReservationsCount.find(item => item.shopId === shop.id)!.reservationCount,
      stylistsCount: totalStylistsCount.find(item => item.shopId === shop.id)!.stylistCount,
    }))

    return { values, totalCount }
  },

  async show(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const stylistLimit = 5
    const reservationLimit = 5
    const menuLimit = 5
    const reviewLimit = 5
    const { id } = query
    const shop = await ShopService.fetchShop(user, id)
    return reconstructShop(shop, user, {
      stylistLimit, reservationLimit, menuLimit, reviewLimit,
    })
  },

  async insert(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, seats, startTime, endTime, details,
    } = await shopUpsertSchema.parseAsync(query)

    const entityDays = days.map((d: ScheduleDays) => convertInboundDaysToEntityDays(d))
    const shop = await ShopService.insertShop(user,
      name, areaId, prefectureId, cityId, address,
      phoneNumber, entityDays, seats, startTime, endTime, details)

    return reconstructShop(shop, user, {})
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      name, areaId, prefectureId, cityId, address, phoneNumber,
      seats, days, startTime, endTime, details,
    } = await shopUpsertSchema.parseAsync(query.params)
    const { id } = query
    const entityDays = days.map((d: ScheduleDays) => convertInboundDaysToEntityDays(d))
    const shop = await ShopService.updateShop(user, id, name, areaId, prefectureId, cityId,
      address, phoneNumber, entityDays, seats, startTime, endTime, details)
    return reconstructShop(shop, user, {})
  },

  async delete(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { id } = query
    const shop = await ShopService.deleteShop(user, id)
    return reconstructShop(shop, user, {})
  },

  async searchShops(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      keyword, page, order, take,
    } = await searchSchema.parseAsync(query)
    const { shops, totalCount } = await ShopService.searchShops(
      user,
      keyword,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const shopIds = shops.map(s => s.id)
    const totalReservationsCount = await ReservationService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await StylistService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      address: shop.address,
      prefectureName: shop.prefecture.name,
      cityName: shop.city.name,
      reservationsCount: totalReservationsCount.find(item => item.shopId === shop.id)!.reservationCount,
      stylistsCount: totalStylistsCount.find(item => item.shopId === shop.id)!.stylistCount,
    }))
    return { values, totalCount }
  },

}

export default ShopController
