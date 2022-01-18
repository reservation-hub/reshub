import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'
import { User, UserForAuth } from '@entities/User'
import { Stylist } from '@entities/Stylist'
import ShopService from '@dashboard/services/ShopService'
import UserService from '@dashboard/services/UserService'
import { DashboardControllerInterface } from '@controller-adapter/Dashboard'
import { RoleSlug } from '@entities/Role'
import { salonIndexAdminResponse, salonIndexShopStaffResponse } from '@request-response-types/Dashboard'
import { Menu } from '@entities/Menu'
import ReservationService from '@dashboard/services/ReservationService'
import StylistService from '@dashboard/services/StylistService'
import MenuService from '@dashboard/services/MenuService'
import Logger from '@lib/Logger'
import { UnauthorizedError } from '@errors/ControllerErrors'

export type UserServiceInterface = {
  fetchUsersWithReservationCounts(): Promise<{ users: (User & { reservationCount: number })[], totalCount: number }>
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

export type ShopServiceInterface = {
  fetchShopsWithStylistCountsAndReservationCounts(user?: UserForAuth): Promise<{ shops: (Shop & {
    stylistCount: number, reservationCount: number })[], totalCount: number }>
}

export type ReservationServiceInterface = {
  fetchReservationsWithClientAndStylistAndMenu(user: UserForAuth): Promise<(Reservation &
    { client: User, menu: Menu, shop: Shop, stylist?: Stylist })[]>
}

export type StylistServiceInterface = {
  fetchStylistsWithReservationCount(user: UserForAuth): Promise<(Stylist & { reservationCount: number })[]>
}

export type MenuServiceInterface = {
  fetchPopularMenus(user: UserForAuth): Promise<Menu[]>
}

const salonIndexForAdmin = async (): Promise<salonIndexAdminResponse> => {
  const { users, totalCount: userTotalCount } = await UserService.fetchUsersWithReservationCounts()
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsWithStylistCountsAndReservationCounts()
  const shopData = shops.map(s => ({
    id: s.id,
    name: s.name!,
    phoneNumber: s.phoneNumber!,
    address: s.address!,
    prefectureName: s.prefecture.name,
    cityName: s.city.name,
    reservationsCount: s.reservationCount,
    stylistsCount: s.stylistCount,
  }))

  const usersForList = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email!,
    firstNameKana: u.firstNameKana!,
    lastNameKana: u.lastNameKana!,
    role: u.role,
    reservationCount: u.reservationCount,
  }))

  return {
    user: { users: usersForList, totalCount: userTotalCount },
    shop: { shopData, totalCount: shopTotalCount },
  }
}

const salonIndexForShopStaff = async (user: UserForAuth): Promise<salonIndexShopStaffResponse> => {
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsWithStylistCountsAndReservationCounts(user)
  const shopData = shops.map(s => ({
    id: s.id,
    name: s.name!,
    phoneNumber: s.phoneNumber,
    address: s.address,
    prefectureName: s.prefecture.name,
    cityName: s.city.name,
    reservationsCount: s.reservationCount,
    stylistsCount: s.stylistCount,
  }))

  // reservations
  const reservations = await ReservationService.fetchReservationsWithClientAndStylistAndMenu(user)
  const reservationList = reservations.map(r => ({
    id: r.id,
    shopId: r.shopId,
    shopName: r.shop.name,
    clientName: `${r.client.lastNameKana!} ${r.client.firstNameKana!}`,
    menuName: r.menu.name,
    stylistName: r.stylist?.name,
    status: r.status,
    reservationDate: r.reservationDate.toDateString(),
  }))

  // stylists
  const stylists = await StylistService.fetchStylistsWithReservationCount(user)
  const stylistList = stylists.map(s => ({
    id: s.id,
    shopId: s.shopId,
    name: s.name,
    price: s.price,
    reservationCount: s.reservationCount,
  }))

  // popular menu
  const popularMenus = await MenuService.fetchPopularMenus(user)

  return {
    shops: shopData, shopTotalCount, stylists: stylistList, reservations: reservationList, popularMenus,
  }
}

const DashboardController : DashboardControllerInterface = {
  async salon(user) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      return salonIndexForShopStaff(user)
    }
    return salonIndexForAdmin()
  },

}

export default DashboardController
