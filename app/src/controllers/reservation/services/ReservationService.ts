import { OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { RoleSlug } from '@entities/Role'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { User } from '@entities/User'

import { ReservationServiceInterface } from '@reservation/ReservationController'
import ReservationRepository from '@reservation/repositories/ReservationRepository'
import MenuRepository from '@reservation/repositories/MenuRepository'
import UserRepository from '@reservation/repositories/UserRepository'
import ShopRepository from '@reservation/repositories/ShopRepository'
import StylistRepository from '@reservation/repositories/StylistRepository'
import { AuthorizationError, NotFoundError } from '@reservation/services/ServiceError'

export type ReservationRepositoryInterface = {
  fetchShopReservations(userId: number, shopId: number, page: number, order: OrderBy): Promise<Reservation[]>
  fetchShopTotalReservationCount(shopId: number): Promise<number>
  fetchShopReservation(shopId: number, reservationId: number): Promise<Reservation | null>
}

export type MenuRepositoryInterface = {
  fetchMenusByIds(menuIds: number[]): Promise<Menu[]>
}

export type UserRepositoryInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
  fetchShopsByIds(shopIds: number[]): Promise<Shop[]>
}

export type StylistRepositoryInterface = {
  fetchStylistsByIds(stylistIds: number[]): Promise<Stylist[]>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  const result = userShopIds.some(id => id === shopId)
  return result
}

const ReservationService: ReservationServiceInterface = {
  async fetchReservationsWithClientAndStylistAndMenu(user, shopId, page = 1, order = OrderBy.DESC) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservations = await ReservationRepository.fetchShopReservations(user.id, shopId, page, order)
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

  async fetchShopReservationTotalCount(user, shopId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return ReservationRepository.fetchShopTotalReservationCount(shopId)
  },

  async fetchReservationWithClientAndStylistAndMenu(user, shopId, reservationId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservation = await ReservationRepository.fetchShopReservation(shopId, reservationId)
    if (!reservation) {
      console.error('Reservation does not exist')
      throw new NotFoundError()
    }

    const reservationMenus = await MenuRepository.fetchMenusByIds([reservation.menuId])
    const reservationClients = await UserRepository.fetchUsersByIds([reservation.clientId])
    const reservationShops = await ShopRepository.fetchShopsByIds([reservation.shopId])
    let reservationStylists: Stylist[]
    if (reservation.stylistId) {
      reservationStylists = await StylistRepository.fetchStylistsByIds([reservation.stylistId])
    } else {
      reservationStylists = []
    }

    return {
      ...reservation,
      shop: reservationShops[0],
      stylist: reservationStylists[0],
      menu: reservationMenus[0],
      client: reservationClients[0],
    }
  },

}

export default ReservationService
