import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'
import { User } from '@entities/User'
import { Stylist } from '@entities/Stylist'
import ShopService from '@services/ShopService'
import UserService from '@services/UserService'
import { DashboardControllerInterface } from '@controller-adapter/Dashboard'
import { RoleSlug } from '@entities/Role'
import { salonIndexAdminResponse, salonIndexShopStaffResponse } from '@request-response-types/Dashboard'
import LocationService from '@services/LocationService'

export type UserServiceInterface = {
  fetchUsersForDashboard(): Promise<{ users: User[], totalCount: number }>
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number}[]>
}

export type ShopServiceInterface = {
  fetchShopsForDashboard(): Promise<{ shops: Shop[], totalCount: number }>
  fetchShopsForDashboardForShopStaff(user: User): Promise<{ shops: Shop[], totalCount: number }>
  fetchShopsStylists(user: User, shopIds: number[]): Promise<Stylist[]>
  fetchStylistsReservationCounts(user: User, stylistIds: number[])
    : Promise<{ stylistId: number, reservationCount: number }[]>
  // fetchShopsPopularMenus(shops: Shop[]): Promise<MenuItem[]>
  fetchShopsReservations(user: User, shopIds: number[]): Promise<Reservation[]>
}

type fetchLocationNamesParams = {
  shopId: number
  areaId: number
  prefectureId: number
  cityId: number
}
export type LocationServiceInterface = {
  fetchLocationNamesOfShops(user: User, params: fetchLocationNamesParams[]): Promise<{
    shopId: number, areaName: string, prefectureName: string, cityName: string}[]>
}

const salonIndexForAdmin = async (user: User): Promise<salonIndexAdminResponse> => {
  const { users, totalCount: userTotalCount } = await UserService.fetchUsersForDashboard()
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsForDashboard()
  const userReservationCounts = await UserService.fetchUsersReservationCounts(users.map(u => u.id))
  const shopIds = shops.map(shop => shop.id)
  const locationNamesOfShops = await LocationService.fetchLocationNamesOfShops(
    user,
    shops.map(s => ({
      shopId: s.id,
      areaId: s.area!.id,
      prefectureId: s.prefecture!.id,
      cityId: s.city!.id,
    })),
  )
  const stylistCounts = await ShopService.fetchStylistsCountByShopIds(shopIds)
  const reservationCounts = await ShopService.fetchReservationsCountByShopIds(shopIds)
  const shopData = shops.map(s => {
    const locationNames = locationNamesOfShops.find(l => l.shopId === s.id)!
    return {
      id: s.id,
      name: s.name!,
      phoneNumber: s.phoneNumber!,
      address: s.address!,
      prefectureName: locationNames.prefectureName,
      cityName: locationNames.cityName,
      reservationsCount: reservationCounts.find(item => item.id === s.id)!.count,
      stylistsCount: stylistCounts.find(item => item.id === s.id)!.count,
    }
  })

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

const salonIndexForShopStaff = async (user: User): Promise<salonIndexShopStaffResponse> => {
  const { shops, totalCount: shopTotalCount } = await ShopService.fetchShopsForDashboardForShopStaff(user)
  const shopIds = shops.map(shop => shop.id)
  const locationNamesOfShops = await LocationService.fetchLocationNamesOfShops(
    user,
    shops.map(s => ({
      shopId: s.id,
      areaId: s.area!.id,
      prefectureId: s.prefecture!.id,
      cityId: s.city!.id,
    })),
  )
  const stylistCounts = await ShopService.fetchStylistsCountByShopIds(shopIds)
  const reservationCounts = await ShopService.fetchReservationsCountByShopIds(shopIds)
  const shopData = shops.map(s => {
    const locationNames = locationNamesOfShops.find(l => l.shopId === s.id)!
    return {
      id: s.id,
      name: s.name!,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: locationNames.prefectureName,
      cityName: locationNames.cityName,
      reservationsCount: reservationCounts.find(item => item.id === s.id)!.count,
      stylistsCount: stylistCounts.find(item => item.id === s.id)!.count,
    }
  })
  // reservations
  const reservations = await ShopService.fetchShopsReservations(user, shopIds)
  const reservationList = reservations.map(r => ({
    id: r.id,
    shopName: r.shop!.name!,
    clientName: `${r.user.lastNameKana!} ${r.user.firstNameKana!}`,
    menuItemName: r.menuItem.name,
    stylistName: r.stylist!.name ?? null,
    status: r.status,
  }))

  // stylists
  const stylists = await ShopService.fetchShopsStylists(user, shops.map(s => s.id))
  const stylistReservationCounts = await ShopService.fetchStylistsReservationCounts(user, stylists.map(s => s.id))
  const stylistList = stylists.map(s => ({
    id: s.id,
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
    return salonIndexForAdmin(user)
  },

}

export default DashboardController
