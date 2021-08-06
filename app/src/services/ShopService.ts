import { ShopRepository } from '../repositories/ShopRepository'
import { Shop } from '../entities/Shop'
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
  deleteShop(id: number): Promise<Shop>
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

export const fetchShopsWithTotalCount = async (query: fetchModelsWithTotalCountQuery)
  : Promise<{ data: Shop[], totalCount: number }> => {
  const shops = await ShopRepository.fetchAll(query.page, query.order)
  const shopsCount = await ShopRepository.totalCount()
  return { data: shops, totalCount: shopsCount }
}

export const fetchShop = async (id: number): Promise<Shop> => {
  const shop = await ShopRepository.fetch(id)
  if (!shop) {
    throw new NotFoundError()
  }
  return shop
}

export const insertShop = async (query: insertShopQuery): Promise<Shop> => {
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
}

export const updateShop = async (id: number, query: updateShopQuery): Promise<Shop> => {
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
}

export const deleteShop = async (id: number): Promise<Shop> => {
  const shop = await ShopRepository.fetch(id)
  if (!shop) {
    throw new NotFoundError()
  }
  return ShopRepository.deleteShop(id)
}

export const fetchStylistsCountByShopIds = async (shopIds: number[])
: Promise<{ id: number, count: number }[]> => {
  if (shopIds.length === 0) {
    return []
  }
  return StylistRepository.fetchStylistsCountByShopIds(shopIds)
}

export const fetchReservationsCountByShopIds = async (shopIds: number[])
: Promise<{ id: number, count: number }[]> => {
  if (shopIds.length === 0) {
    return []
  }
  return ReservationRepository.fetchReservationsCountByShopIds(shopIds)
}

export const ShopService: ShopServiceInterface = {
  fetchShopsWithTotalCount,
  fetchShop,
  insertShop,
  updateShop,
  deleteShop,
  fetchStylistsCountByShopIds,
  fetchReservationsCountByShopIds,
}

export default ShopService
