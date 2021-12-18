import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'
import { User, UserForAuth } from '@entities/User'
import { Stylist } from '@entities/Stylist'
import ShopService from '@services/ShopService'
import UserService from '@services/UserService'
import { DashboardControllerInterface } from '@controller-adapter/Dashboard'
import { RoleSlug } from '@entities/Role'
import { salonIndexAdminResponse, salonIndexShopStaffResponse } from '@request-response-types/Dashboard'
import { Menu } from '@entities/Menu'

export type UserServiceInterface = {
  fetchUsersForDashboard(): Promise<{ users: User[], totalCount: number }>
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number}[]>
}

export type ShopServiceInterface = {
  fetchShopsForDashboard(): Promise<{ shops: Shop[], totalCount: number }>
  fetchShopsForDashboardForShopStaff(user: UserForAuth): Promise<{ shops: Shop[], totalCount: number }>
  fetchShopStaffReservationForDashboard(user: UserForAuth): Promise<Reservation[]>
  fetchShopStaffStylistsForDashboard(user: UserForAuth): Promise<Stylist[]>
  fetchStylistsReservationCounts(user: UserForAuth, stylistIds: number[])
    : Promise<{ stylistId: number, reservationCount: number }[]>
  fetchShopsByIds(user: UserForAuth, shopIds: number[]): Promise<Shop[]>
  fetchStylistsByIds(user: UserForAuth, stylistIds: number[]): Promise<Stylist[]>
  fetchMenusByIds(user: UserForAuth, menuIds: number[]): Promise<Menu[]>
}

const salonIndexForAdmin = async (): Promise<salonIndexAdminResponse> => {
  const { users, totalCount: userTotalCount } = await UserService.fetchUsersForDashboard()
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsForDashboard()
  const userReservationCounts = await UserService.fetchUsersReservationCounts(users.map(u => u.id))
  const shopIds = shops.map(shop => shop.id)
  const stylistCounts = await ShopService.fetchStylistsCountByShopIds(shopIds)
  const reservationCounts = await ShopService.fetchReservationsCountByShopIds(shopIds)
  const shopData = shops.map(s => ({
    id: s.id,
    name: s.name!,
    phoneNumber: s.phoneNumber!,
    address: s.address!,
    prefectureName: s.prefecture.name,
    cityName: s.city.name,
    reservationsCount: reservationCounts.find(item => item.id === s.id)!.count,
    stylistsCount: stylistCounts.find(item => item.id === s.id)!.count,
  }))

  const usersForList = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email!,
    firstNameKana: u.firstNameKana!,
    lastNameKana: u.lastNameKana!,
    role: u.role,
    reservationCount: userReservationCounts.find(urc => urc.userId === u.id)!.reservationCount,
  }))

  return {
    user: { users: usersForList, totalCount: userTotalCount },
    shop: { shopData, totalCount: shopTotalCount },
  }
}

const salonIndexForShopStaff = async (user: UserForAuth): Promise<salonIndexShopStaffResponse> => {
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsForDashboardForShopStaff(user)
  const shopIds = shops.map(shop => shop.id)
  const stylistCounts = await ShopService.fetchStylistsCountByShopIds(shopIds)
  const reservationCounts = await ShopService.fetchReservationsCountByShopIds(shopIds)
  const shopData = shops.map(s => ({
    id: s.id,
    name: s.name!,
    phoneNumber: s.phoneNumber,
    address: s.address,
    prefectureName: s.prefecture.name,
    cityName: s.city.name,
    reservationsCount: reservationCounts.find(item => item.id === s.id)!.count,
    stylistsCount: stylistCounts.find(item => item.id === s.id)!.count,
  }))

  // reservations
  const reservations = await ShopService.fetchShopStaffReservationForDashboard(user)
  const clients = await UserService.fetchUsersByIds(reservations.map(r => r.clientId))
  const reservationShops = await ShopService.fetchShopsByIds(user, reservations.map(r => r.shopId))
  const stylistIds = reservations.map(r => r.stylistId).filter((r): r is number => typeof r === 'number')
  const reservationStylists = await ShopService.fetchStylistsByIds(user, stylistIds)
  const menus = await ShopService.fetchMenusByIds(user, reservations.map(r => r.menuId))

  const reservationList = reservations.map(r => {
    const client = clients.find(c => c.id === r.clientId)!
    const shop = reservationShops.find(rs => rs.id === r.shopId)!
    const stylist = reservationStylists.find(rs => rs.id === r.stylistId)
    const menu = menus.find(m => m.id === r.menuId)!
    return {
      id: r.id,
      shopId: r.shopId,
      shopName: shop.name,
      clientName: `${client.lastNameKana!} ${client.firstNameKana!}`,
      menuName: menu.name,
      stylistName: stylist?.name,
      status: r.status,
      reservationDate: r.reservationDate,
    }
  })

  // stylists
  const stylists = await ShopService.fetchShopStaffStylistsForDashboard(user)
  const stylistReservationCounts = await ShopService.fetchStylistsReservationCounts(user, stylists.map(s => s.id))
  const stylistList = stylists.map(s => ({
    id: s.id,
    shopId: s.shopId,
    name: s.name,
    price: s.price,
    reservationCount: stylistReservationCounts.find(src => src.stylistId === s.id)!.reservationCount,
  }))

  // popular menu
  // TODO: implement
  return {
    shops: shopData, shopTotalCount, stylists: stylistList, reservations: reservationList,
  }
}

const DashboardController : DashboardControllerInterface = {
  async salon(user) {
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      return salonIndexForShopStaff(user)
    }
    return salonIndexForAdmin()
  },

}

export default DashboardController
