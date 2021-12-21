import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'
import { User } from '@entities/User'
import { ReservationServiceInterface } from '@dashboard//DashboardController'
import ReservationRepository from '@dashboard/repositories/ReservationRepository'
import MenuRepository from '@dashboard/repositories/MenuRepository'
import UserRepository from '@dashboard/repositories/UserRepository'
import ShopRepository from '@dashboard/repositories/ShopRepository'
import { Stylist } from '@entities/Stylist'
import StylistRepository from '@dashboard/repositories/StylistRepository'

export type ReservationRepositoryInterface = {
  fetchShopStaffReservations(userId: number): Promise<Reservation[]>
}

export type MenuRepositoryInterface = {
  fetchMenusByIds(menuIds: number[]): Promise<Menu[]>
}

export type UserRepositoryInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

export type ShopRepositoryInterface = {
  fetchShopsByIds(shopIds: number[]): Promise<Shop[]>
}

export type StylistRepositoryInterface = {
  fetchStylistsByIds(stylistIds: number[]): Promise<Stylist[]>
}

const ReservationService: ReservationServiceInterface = {
  async fetchReservationsWithClientAndStylistAndMenu(user) {
    const reservations = await ReservationRepository.fetchShopStaffReservations(user.id)
    const menuIds: number[] = []
    const clientIds: number[] = []
    const shopIds: number[] = []
    const stylistIds: number[] = []
    reservations.forEach(r => {
      menuIds.push(r.menuId)
      clientIds.push(r.clientId)
      shopIds.push(r.shopId)
      if (r.stylistId) {
        stylistIds.push(r.stylistId)
      }
    })
    const reservationMenus = await MenuRepository.fetchMenusByIds(menuIds)
    const reservationClients = await UserRepository.fetchUsersByIds(clientIds)
    const reservationShops = await ShopRepository.fetchShopsByIds(shopIds)
    const reservationStylists = await StylistRepository.fetchStylistsByIds(stylistIds)

    return reservations.map(r => ({
      ...r,
      shop: reservationShops.find(s => s.id === r.shopId)!,
      stylist: reservationStylists.find(s => s.id === r.stylistId),
      menu: reservationMenus.find(m => m.id === r.menuId)!,
      client: reservationClients.find(c => c.id === r.clientId)!,
    }))
  },
}

export default ReservationService
