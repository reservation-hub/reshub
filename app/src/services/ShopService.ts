import { ShopRepository } from '../repositories/ShopRepository'
import { Shop, ShopSchedule } from '../entities/Shop'
import { Reservation } from '../entities/Reservation'
import { ShopServiceInterface } from '../controllers/shopController'
import StylistRepository from '../repositories/StylistRepository'
import ReservationRepository from '../repositories/ReservationRepository'
import { LocationRepository } from '../repositories/LocationRepository'
import { fetchModelsWithTotalCountQuery } from './ServiceCommonTypes'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

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

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

export const ShopService: ShopServiceInterface = {
  async fetchShopsWithTotalCount(query) {
    const shops = await ShopRepository.fetchAll(query.page, query.order)
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
}

export default ShopService
