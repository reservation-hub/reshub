import { ShopRepository } from '../repositories/ShopRepository'
import { Shop, ShopSchedule } from '../entities/Shop'
import { Reservation } from '../entities/Reservation'
import { ShopServiceInterface as ShopControllerSocket } from '../controllers/shopController'
import { ShopServiceInterface as MenuControllerSocket } from '../controllers/menuController'
import { ShopServiceInterface as DashboardControllerSocket } from '../controllers/dashboardController'
import StylistRepository from '../repositories/StylistRepository'
import ReservationRepository from '../repositories/ReservationRepository'
import { LocationRepository } from '../repositories/LocationRepository'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'
import { MenuItem } from '../entities/Menu'

export type ShopRepositoryInterface = {
  insertShop(
    name: string,
    areaId: number,
    prefectureId: number,
    cityId: number,
    address: string,
    phoneNumber: string,
  ): Promise<Shop>,
  updateShop(
    id: number,
    name: string,
    areaId: number,
    prefectureId: number,
    cityId: number,
    address: string,
    phoneNumber: string,
  ): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  upsertSchedule(shopId: number, days: number[], start: string, end: string)
    : Promise<ShopSchedule>
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>,
  updateMenuItem(menuItemId: number, name: string, description: string, price: number): Promise<MenuItem>,
  deleteMenuItem(menuItemId: number): Promise<MenuItem>
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>,
}

export type StylistRepositoryInterface = {
  fetchStylistsByShopIds(shopIds: number[])
    : Promise<{ id: number, name: string, shopId:number }[]>,
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ id: number, count: number }[]>,
}

export type ReservationRepositoryInterface = {
  fetchReservationsByShopIds(shopIds: number[])
    : Promise<{ id: number, data: Reservation[] }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
}

export type MenuRepositoryInterface = {
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>
}

export type insertShopQuery = {
  name: string,
  areaId: number,
  prefectureId: number,
  cityId: number,
  address: string,
  phoneNumber: string,
}

export type updateShopQuery = {
  name: string,
  areaId: number,
  prefectureId: number,
  cityId: number,
  address: string,
  phoneNumber: string,
}

export type upsertScheduleQuery = {
  days: number[],
  hours: {
    start: string,
    end: string
  }
}

export type upsertMenuItemQuery = {
  name: string,
  description: string,
  price: number,
}

export type upsertStylistQuery = {
  name: string,
  price: number
}

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

export const ShopService: ShopControllerSocket & MenuControllerSocket & DashboardControllerSocket = {

  async fetchShopsForDashboard() {
    const shops = await ShopRepository.fetchAll({ limit: 5 })
    const shopsCount = await ShopRepository.totalCount()
    return { shops, totalCount: shopsCount }
  },

  async fetchShopsWithTotalCount(query) {
    const shops = await ShopRepository.fetchAll(query)
    const shopsCount = await ShopRepository.totalCount()
    return { data: shops, totalCount: shopsCount }
  },

  async fetchShop(id) {
    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }
    return shop
  },

  async insertShop(query) {
    const isValidLocation = await LocationRepository.isValidLocation(query.areaId, query.prefectureId, query.cityId)
    if (!isValidLocation) {
      throw new InvalidParamsError()
    }

    return ShopRepository.insertShop(
      query.name,
      query.areaId,
      query.prefectureId,
      query.cityId,
      query.address,
      query.phoneNumber,
    )
  },

  async updateShop(id, query) {
    const isValidLocation = await LocationRepository.isValidLocation(query.areaId, query.prefectureId, query.cityId)
    if (!isValidLocation) {
      throw new InvalidParamsError()
    }

    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }

    return ShopRepository.updateShop(id, query.name, query.areaId, query.prefectureId,
      query.cityId, query.address, query.phoneNumber)
  },

  async deleteShop(id) {
    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }
    return ShopRepository.deleteShop(id)
  },

  async fetchStylistsCountByShopIds(shopIds) {
    if (shopIds.length === 0) {
      return []
    }
    return StylistRepository.fetchStylistsCountByShopIds(shopIds)
  },

  async fetchReservationsCountByShopIds(shopIds) {
    if (shopIds.length === 0) {
      return []
    }
    return ReservationRepository.fetchReservationsCountByShopIds(shopIds)
  },

  async upsertSchedule(shopId, query) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }

    const startHour = convertToUnixTime(query.hours.start)
    const endHour = convertToUnixTime(query.hours.end)
    if (query.days.length === 0 || endHour <= startHour) {
      throw new InvalidParamsError()
    }

    const uniqueDays: number[] = query.days.filter((n, i) => query.days.indexOf(n) === i)

    const schedule = await ShopRepository.upsertSchedule(
      shop.id,
      uniqueDays,
      query.hours.start,
      query.hours.end,
    )
    return schedule
  },

  async insertMenuItem(shopId, query) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }
    const menuItem = await ShopRepository.insertMenuItem(shopId, query.name,
      query.description, query.price)
    return menuItem
  },

  async updateMenuItem(shopId, menuItemId, query) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }
    const menuItemIdIsValid = shop.menu!.items.findIndex(item => item.id === menuItemId) !== -1
    if (!menuItemIdIsValid) {
      throw new NotFoundError()
    }

    return ShopRepository.updateMenuItem(menuItemId, query.name,
      query.description, query.price)
  },

  async deleteMenuItem(shopId, menuItemId) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }
    const menuItemIdIsValid = shop.menu!.items.findIndex(item => item.id === menuItemId) !== -1
    if (!menuItemIdIsValid) {
      console.error('menu item not found')
      throw new NotFoundError()
    }

    return ShopRepository.deleteMenuItem(menuItemId)
  },

  async insertStylist(shopId, query) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.insertStylist(
      query.name,
      query.price,
      shopId,
    )
    return stylist
  },

  async updateStylist(shopId, stylistId, query) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.fetch(stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.updateStylist(
      stylistId,
      query.name,
      query.price,
      shopId,
    )
  },

  async deleteStylist(shopId, stylistId) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.fetch(stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.deleteStylist(stylistId)
  },
}

export default ShopService
