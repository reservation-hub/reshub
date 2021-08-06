import { Stylist } from '../entities/Stylist'
import StylistRepository from '../repositories/StylistRepository'
import { StylistServiceInterface } from '../controllers/stylistController'
import { fetchModelsWithTotalCountQuery } from './ServiceCommonTypes'
import { ShopRepository } from '../repositories/ShopRepository'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type upsertStylistQuery = {
  name: string,
  shopIDs: number[],
}

export type StylistRepositoryInterface = {
  insertStylist(name: string, shopIDs: number[]): Promise<Stylist>,
  updateStylist(id: number, name: string, shopIDsToAdd: number[], shopIDsToRemove: number[])
  :Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
}

export type ShopRepositoryInterface = {
  fetchValidShopIDs(shopIDs: number[]): Promise<number[]>
}

export const fetchStylistsWithTotalCount = async (query: fetchModelsWithTotalCountQuery)
: Promise<{ data: Stylist[], totalCount: number }> => {
  const stylists = await StylistRepository.fetchAll(query.page, query.order)
  const stylistCounts = await StylistRepository.totalCount()
  return { data: stylists, totalCount: stylistCounts }
}

export const fetchStylist = async (id: number): Promise<Stylist> => {
  const stylist = await StylistRepository.fetch(id)
  if (!stylist) {
    throw new NotFoundError()
  }
  return stylist
}

export const insertStylist = async (query: upsertStylistQuery): Promise<Stylist> => {
  const validShopIDs = await ShopRepository.fetchValidShopIDs(query.shopIDs)
  if (validShopIDs.length === 0) {
    throw new InvalidParamsError()
  }

  return StylistRepository.insertStylist(query.name, validShopIDs)
}

export const updateStylist = async (id:number, query: upsertStylistQuery): Promise<Stylist> => {
  const validShopIDs = await ShopRepository.fetchValidShopIDs(query.shopIDs)
  if (validShopIDs.length === 0) {
    throw new InvalidParamsError()
  }

  const stylist = await StylistRepository.fetch(id)
  if (!stylist) {
    throw new NotFoundError()
  }

  const stylistShopIDs = stylist.shops.map(shop => shop.id)
  const shopIDsToAdd = validShopIDs.filter(
    validShopID => stylistShopIDs.indexOf(validShopID) === -1,
  )
  const shopIDsToRemove = stylistShopIDs.filter(
    ssid => validShopIDs.indexOf(ssid) === -1,
  )

  return StylistRepository.updateStylist(id, query.name, shopIDsToAdd, shopIDsToRemove)
}

export const deleteStylist = async (id:number): Promise<Stylist> => {
  const stylist = await StylistRepository.fetch(id)
  if (!stylist) {
    throw new NotFoundError()
  }
  return StylistRepository.deleteStylist(id)
}

const StylistService: StylistServiceInterface = {
  fetchStylistsWithTotalCount,
  fetchStylist,
  insertStylist,
  updateStylist,
  deleteStylist,
}

export default StylistService
