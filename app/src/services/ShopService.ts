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
    areaID: number,
    prefectureID: number,
    cityID: number,
    address: string,
    phoneNumber: string,
  ): Promise<Shop>,
  updateShop(
    id: number,
    name: string,
    areaID: number,
    prefectureID: number,
    cityID: number,
    address: string,
    phoneNumber: string,
  ): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>
}

export type LocationRepositoryInterface = {
  isValidLocation(areaID: number, prefectureID: number, cityID: number): Promise<boolean>,
}

export type StylistRepositoryInterface = {
  fetchStylistsByShopIDs(shopIDs: number[])
    : Promise<{ id: number, name: string, shopID:number }[]>,
  fetchStylistsCountByShopIDs(shopIDs: number[]): Promise<{ id: number, count: number }[]>,
}

export type ReservationRepositoryInterface = {
  fetchReservationsByShopIDs(shopIDs: number[])
    : Promise<{ id: number, data: Reservation[] }[]>,
  fetchReservationsCountByShopIDs(shopIDs: number[])
    : Promise<{ id: number, count: number }[]>,
}

export type insertShopQuery = {
  name: string,
  areaID: number,
  prefectureID: number,
  cityID: number,
  address: string,
  phoneNumber: string,
}

export type updateShopQuery = {
  name: string,
  areaID: number,
  prefectureID: number,
  cityID: number,
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
  const isValidLocation = await LocationRepository.isValidLocation(query.areaID, query.prefectureID, query.cityID)
  if (!isValidLocation) {
    throw new InvalidParamsError()
  }

  return ShopRepository.insertShop(
    query.name,
    query.areaID,
    query.prefectureID,
    query.cityID,
    query.address,
    query.phoneNumber,
  )
}

export const updateShop = async (id: number, query: updateShopQuery): Promise<Shop> => {
  const isValidLocation = await LocationRepository.isValidLocation(query.areaID, query.prefectureID, query.cityID)
  if (!isValidLocation) {
    throw new InvalidParamsError()
  }

  const shop = await ShopRepository.fetch(id)
  if (!shop) {
    throw new NotFoundError()
  }

  return ShopRepository.updateShop(id, query.name, query.areaID, query.prefectureID,
    query.cityID, query.address, query.phoneNumber)
}

export const deleteShop = async (id: number): Promise<Shop> => {
  const shop = await ShopRepository.fetch(id)
  if (!shop) {
    throw new NotFoundError()
  }
  return ShopRepository.deleteShop(id)
}

export const fetchStylistsCountByShopIDs = async (shopIDs: number[])
: Promise<{ id: number, count: number }[]> => {
  if (shopIDs.length === 0) {
    return []
  }
  return StylistRepository.fetchStylistsCountByShopIDs(shopIDs)
}

export const fetchReservationsCountByShopIDs = async (shopIDs: number[])
: Promise<{ id: number, count: number }[]> => {
  if (shopIDs.length === 0) {
    return []
  }
  return ReservationRepository.fetchReservationsCountByShopIDs(shopIDs)
}

export const ShopService: ShopServiceInterface = {
  fetchShopsWithTotalCount,
  fetchShop,
  insertShop,
  updateShop,
  deleteShop,
  fetchStylistsCountByShopIDs,
  fetchReservationsCountByShopIDs,
}

export default ShopService
