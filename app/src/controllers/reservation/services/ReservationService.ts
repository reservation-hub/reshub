import { OrderBy, ScheduleDays } from '@entities/Common'
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
import {
  AuthorizationError, NotFoundError, InvalidParamsError,
} from '@errors/ServiceErrors'
import isWithinSchedule from '@lib/ScheduleChecker'
import today from '@lib/Today'

export type ReservationRepositoryInterface = {
  fetchShopReservations(shopId: number, page: number, order: OrderBy, take: number): Promise<Reservation[]>
  fetchShopReservationsForCalendar(shopId: number, year: number, month: number): Promise<Reservation[]>
  fetchShopTotalReservationCount(shopId: number): Promise<number>
  fetchShopReservation(shopId: number, reservationId: number): Promise<Reservation | null>
  insertReservation(reservationDate: Date, userId: number, shopId: number, menuId: number, stylistId?: number)
    : Promise<Reservation>
  updateReservation(id: number, reservationDate: Date, userId: number, shopId: number,
    menuId: number, stylistId?: number): Promise<Reservation>
  cancelReservation(id: number): Promise<Reservation>
  reservationExists(reservationId: number): Promise<boolean>
  fetchShopReservationsForAvailabilityWithMenuDuration(shopId: number, reservationDate: Date,
    rangeInDays: number) :Promise<(Reservation & { duration: number })[]>
}

export type MenuRepositoryInterface = {
  fetchMenusByIds(menuIds: number[]): Promise<Menu[]>
  fetchShopMenu(shopId: number, menuId: number): Promise<Menu | null>
  fetchMenuIdsByShopId(shopId: number): Promise<number[]>
  fetchMenuDuration(menuId: number, shopId: number): Promise<number | null>
}

export type UserRepositoryInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
  userExists(userId: number): Promise<boolean>
}

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
  fetchShopsByIds(shopIds: number[]): Promise<Shop[]>
  fetchShopSchedule(shopId: number): Promise<{startTime: string, endTime: string,
  seats: number} | null >
  fetchShopDetailsForReservation(shopId: number)
  : Promise<{ staffId: number, startTime: string, endTime: string, days: ScheduleDays[], seats: number} | null>
}

export type StylistRepositoryInterface = {
  fetchShopStylist(shopId: number, stylistId:number): Promise<Stylist | null>
  fetchStylistsByIds(stylistIds: number[]): Promise<Stylist[]>
  fetchStylistIdsByShopId(shopId: number): Promise<number[]>
}

const getConflictingReservations = (reservationDate: Date, menuDuration: number, shopReservations:
  (Reservation & { duration: number })[]): (Reservation & { duration: number })[] => {
  const reservationStartTime = reservationDate.getTime()
  const reservationEndTime = reservationDate.getTime() + (menuDuration * 1000 * 60)
  return shopReservations.filter(r => {
    const shopReservationStartTime = r.reservationDate.getTime()
    const shopReservationEndTime = r.reservationDate.getTime() + (r.duration * 1000 * 60)
    return (shopReservationStartTime <= reservationStartTime && reservationStartTime < shopReservationEndTime)
      || (shopReservationStartTime < reservationEndTime && reservationEndTime <= shopReservationEndTime)
  })
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const recreateReservationList = async (reservations: Reservation[]) => {
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
}

const reconstructReservation = async (reservation: Reservation) => {
  const menu = (await MenuRepository.fetchMenusByIds([reservation.menuId]))[0]
  const client = (await UserRepository.fetchUsersByIds([reservation.clientId]))[0]
  const shop = (await ShopRepository.fetchShopsByIds([reservation.shopId]))[0]
  let stylist: Stylist | undefined
  if (reservation.stylistId) {
    stylist = (await StylistRepository.fetchStylistsByIds([reservation.stylistId])).pop()
  }

  const reservationEndDate = new Date(reservation.reservationDate.getTime() + menu.duration * 1000 * 60)

  return {
    ...reservation,
    reservationEndDate,
    shop,
    stylist,
    menu,
    client,
  }
}

const ReservationService: ReservationServiceInterface = {
  async fetchReservationsWithClientAndStylistAndMenu(user, shopId, page = 1, order = OrderBy.ASC, take = 10) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const reservations = await ReservationRepository.fetchShopReservations(shopId, page, order, take)
    return recreateReservationList(reservations)
  },

  async fetchReservationsWithClientAndStylistAndMenuForCalendar(user, shopId, year, month) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const reservations = await ReservationRepository.fetchShopReservationsForCalendar(shopId, year, month)

    return recreateReservationList(reservations)
  },

  async fetchShopReservationTotalCount(user, shopId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }
    return ReservationRepository.fetchShopTotalReservationCount(shopId)
  },

  async fetchReservationWithClientAndStylistAndMenu(user, shopId, reservationId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const reservation = await ReservationRepository.fetchShopReservation(shopId, reservationId)
    if (!reservation) {
      throw new NotFoundError('Reservation does not exist')
    }
    return reconstructReservation(reservation)
  },

  async insertReservation(user, shopId, reservationDate, clientId, menuId, stylistId?) {
    const shopDetails = await ShopRepository.fetchShopDetailsForReservation(shopId)
    if (!shopDetails) {
      throw new NotFoundError('Shop does not exist')
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && shopDetails.staffId !== user.id) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    if (reservationDate < today) {
      throw new InvalidParamsError('Invalid date, earlier than today')
    }

    const menu = await MenuRepository.fetchShopMenu(shopId, menuId)
    if (!menu) {
      throw new InvalidParamsError('Menu does not exist in shop')
    }

    // check shop schedule availability
    const reservationEndDate = new Date(reservationDate.getTime() + menu.duration * 1000 * 60)
    const reservationIsWithinShopSchedule = isWithinSchedule(shopDetails.startTime, shopDetails.endTime,
      shopDetails.days, reservationDate, reservationEndDate, [reservationDate.getDay()])

    if (!reservationIsWithinShopSchedule) {
      throw new InvalidParamsError(
        `Reservation date ${reservationDate} is
        not within shop schedule ${shopDetails.startTime} - ${shopDetails.endTime}`,
      )
    }

    // check shop availability

    const reservationsForSameDay = await ReservationRepository.fetchShopReservationsForAvailabilityWithMenuDuration(
      shopId, reservationDate, 1,
    )

    const conflictingReservations = getConflictingReservations(reservationDate, menu.duration, reservationsForSameDay)
    if (conflictingReservations.length >= shopDetails.seats) {
      throw new InvalidParamsError('Provided time is not available')
    }

    // stylist related checks
    let stylist
    if (stylistId) {
      stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
      if (!stylist) {
        throw new InvalidParamsError('Stylist does not exist in shop')
      }

      const reservationIsWithinStylistSchedule = isWithinSchedule(stylist.startTime, stylist.endTime,
        stylist.days, reservationDate, reservationEndDate, [reservationDate.getDay()])
      if (!reservationIsWithinStylistSchedule) {
        throw new InvalidParamsError(
          `Reservation date ${reservationDate} is not within
          stylist schedule ${stylist.startTime} - ${stylist.endTime}`,
        )
      }

      const stylistReservationsForSameDay = reservationsForSameDay.filter(rfs => rfs.stylistId === stylistId)
      const conflictingReservations = getConflictingReservations(
        reservationDate, menu.duration, stylistReservationsForSameDay,
      )
      if (conflictingReservations.length > 0) {
        throw new InvalidParamsError('Stylist is not available for this reservation')
      }
    }

    const reservation = await ReservationRepository.insertReservation(reservationDate, clientId, shopId,
      menuId, stylistId)
    return reconstructReservation(reservation)
  },

  async updateReservation(user, shopId, reservationId, reservationDate, clientId, menuId, stylistId) {
    // check if shop exists
    const shopDetails = await ShopRepository.fetchShopDetailsForReservation(shopId)
    if (!shopDetails) {
      throw new NotFoundError('Shop does not exist')
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && shopDetails.staffId !== user.id) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    // check if reservation exists

    const currentReservation = await ReservationRepository.fetchShopReservation(shopId, reservationId)
    if (!currentReservation) {
      throw new NotFoundError('Reservation does not exist')
    }

    // check if new reservation is valid

    if (reservationDate < today) {
      throw new NotFoundError('Invalid date, earlier than today')
    }

    const clientExists = await UserRepository.userExists(clientId)
    if (!clientExists) {
      throw new NotFoundError(`User ${clientId} does not exist`)
    }

    // check in menu exists
    const menu = await MenuRepository.fetchShopMenu(shopId, menuId)
    if (!menu) {
      throw new InvalidParamsError(`Menu ${menuId} does not exist in shop ${shopId}`)
    }

    // check shop schedule availability
    const reservationEndDate = new Date(reservationDate.getTime() + menu.duration * 1000 * 60)
    const reservationIsWithinShopSchedule = isWithinSchedule(shopDetails.startTime, shopDetails.endTime,
      shopDetails.days, reservationDate, reservationEndDate, [reservationDate.getDay()])

    if (!reservationIsWithinShopSchedule) {
      throw new InvalidParamsError(
        `Reservation date ${reservationDate} is
        not within shop schedule ${shopDetails.startTime} - ${shopDetails.endTime}`,
      )
    }

    // check availability
    const reservationsForSameDay = await ReservationRepository.fetchShopReservationsForAvailabilityWithMenuDuration(
      shopId, reservationDate, 1,
    )

    // remove current reservation from reservationsForThe same day
    const reservationsWithoutCurrentReservation = reservationsForSameDay
      .filter(reservation => reservation.id !== currentReservation.id)

    const conflictingReservations = getConflictingReservations(reservationDate,
      menu.duration, reservationsWithoutCurrentReservation)
    if (conflictingReservations.length >= shopDetails.seats) {
      throw new InvalidParamsError('Provided time is not available')
    }

    // stylist related checks
    let stylist
    if (stylistId) {
      stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
      if (!stylist) {
        throw new InvalidParamsError('Stylist does not exist in shop')
      }

      const reservationIsWithinStylistSchedule = isWithinSchedule(stylist.startTime, stylist.endTime,
        stylist.days, reservationDate, reservationEndDate, [reservationDate.getDay()])
      if (!reservationIsWithinStylistSchedule) {
        throw new InvalidParamsError(
          `Reservation date ${reservationDate} is not within
          stylist schedule ${stylist.startTime} - ${stylist.endTime}`,
        )
      }

      const stylistReservationsForSameDay = reservationsWithoutCurrentReservation
        .filter(rfs => rfs.stylistId === stylistId)

      const conflictingReservations = getConflictingReservations(
        reservationDate, menu.duration, stylistReservationsForSameDay,
      )

      if (conflictingReservations.length > 0) {
        throw new InvalidParamsError('Stylist is not available for this reservation')
      }
    }

    const reservation = await ReservationRepository.updateReservation(reservationId, reservationDate,
      clientId, shopId, menuId, stylistId)
    return reconstructReservation(reservation)
  },

  async cancelReservation(user, shopId, reservationId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const reservationExists = await ReservationRepository.reservationExists(reservationId)
    if (!reservationExists) {
      throw new NotFoundError('Reservation does not exist')
    }

    const reservation = await ReservationRepository.cancelReservation(reservationId)
    return reconstructReservation(reservation)
  },

}

export default ReservationService
