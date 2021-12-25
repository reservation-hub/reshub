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
import { AuthorizationError, NotFoundError, InvalidParamsError } from '@reservation/services/ServiceError'

export type ReservationRepositoryInterface = {
  fetchShopReservations(userId: number, shopId: number, page: number, order: OrderBy): Promise<Reservation[]>
  fetchShopTotalReservationCount(shopId: number): Promise<number>
  fetchShopReservation(shopId: number, reservationId: number): Promise<Reservation | null>
  insertReservation(reservationDate: Date, userId: number, shopId: number, menuId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(id: number, reservationDate: Date, userId: number, shopId: number,
    menuId: number, stylistId?: number): Promise<Reservation>
  cancelReservation(id: number): Promise<Reservation>
  reservationExists(reservationId: number): Promise<boolean>
}

export type MenuRepositoryInterface = {
  fetchMenusByIds(menuIds: number[]): Promise<Menu[]>
  fetchMenuIdsByShopId(shopId: number): Promise<number[]>
}

export type UserRepositoryInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
  userExists(userId: number): Promise<boolean>
}

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
  fetchShopsByIds(shopIds: number[]): Promise<Shop[]>
}

export type StylistRepositoryInterface = {
  fetchStylistsByIds(stylistIds: number[]): Promise<Stylist[]>
  fetchStylistIdsByShopId(shopId: number): Promise<number[]>
}

export const getNextAvailableDate = (reservationDate: Date, menuDuration: number): Date => {
  const nextAvailableDate = new Date(reservationDate)
  nextAvailableDate.setMinutes(nextAvailableDate.getMinutes() + menuDuration)
  return nextAvailableDate
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const isValidMenuId = async (shopId: number, menuId: number): Promise<boolean> => {
  const menuIds = await MenuRepository.fetchMenuIdsByShopId(shopId)
  return menuIds.some(id => id === menuId)
}

const isValidStylistId = async (shopId: number, stylistId: number): Promise<boolean> => {
  const stylistIds = await StylistRepository.fetchStylistIdsByShopId(shopId)
  return stylistIds.some(id => id === stylistId)
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

  async insertReservation(user, shopId, reservationDate, clientId, menuId, stylistId?) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const clientExists = await UserRepository.userExists(clientId)
    if (!clientExists) {
      console.error('User does not exist')
      throw new NotFoundError()
    }

    if (!await isValidMenuId(shopId, menuId)) {
      console.error('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !isValidStylistId(shopId, stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }
    return ReservationRepository.insertReservation(reservationDate, clientId, shopId, menuId, stylistId)
  },

  async updateReservation(user, shopId, reservationId, reservationDate, clientId, menuId, stylistId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservationExists = await ReservationRepository.reservationExists(reservationId)
    if (!reservationExists) {
      console.error('Reservation does not exist')
      throw new NotFoundError()
    }

    const clientExists = await UserRepository.userExists(clientId)
    if (!clientExists) {
      console.error('User does not exist')
      throw new NotFoundError()
    }

    if (!await isValidMenuId(shopId, menuId)) {
      console.error('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    if (stylistId && !isValidStylistId(shopId, stylistId)) {
      console.error('Stylist does not exist in shop')
      throw new InvalidParamsError()
    }

    const dateObj = new Date(reservationDate)
    if (dateObj < new Date()) {
      console.error('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    return ReservationRepository.updateReservation(reservationId, reservationDate,
      clientId, shopId, menuId, stylistId)
  },

  async cancelReservation(user, shopId, reservationId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const reservationExists = await ReservationRepository.reservationExists(reservationId)
    if (!reservationExists) {
      console.error('Reservation does not exist')
      throw new NotFoundError()
    }

    return ReservationRepository.cancelReservation(reservationId)
  },

}

export default ReservationService
