import { Stylist } from '../entities/Stylist'
import StylistRepository from '../repositories/StylistRepository'
import { StylistServiceInterface } from '../controllers/stylistController'
import { ShopRepository } from '../repositories/ShopRepository'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type upsertStylistQuery = {
  name: string,
  shopIds: number[],
}

export type StylistRepositoryInterface = {
  insertStylist(name: string, shopIds: number[]): Promise<Stylist>,
  updateStylist(id: number, name: string, shopIdsToAdd: number[], shopIdsToRemove: number[])
  :Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
}

export type ShopRepositoryInterface = {
  fetchValidShopIds(shopIds: number[]): Promise<number[]>
}

const StylistService: StylistServiceInterface = {
  async fetchStylistsWithTotalCount(query) {
    const stylists = await StylistRepository.fetchAll(query)
    const stylistCounts = await StylistRepository.totalCount()
    return { data: stylists, totalCount: stylistCounts }
  },

  async fetchStylist(id) {
    const stylist = await StylistRepository.fetch(id)
    if (!stylist) {
      throw new NotFoundError()
    }
    return stylist
  },

  async insertStylist(query) {
    const validShopIds = await ShopRepository.fetchValidShopIds(query.shopIds)
    if (validShopIds.length === 0) {
      throw new InvalidParamsError()
    }

    return StylistRepository.insertStylist(query.name, validShopIds)
  },

  async updateStylist(id, query) {
    const validShopIds = await ShopRepository.fetchValidShopIds(query.shopIds)
    if (validShopIds.length === 0) {
      throw new InvalidParamsError()
    }

    const stylist = await StylistRepository.fetch(id)
    if (!stylist) {
      throw new NotFoundError()
    }

    const stylistShopIds = stylist.shops.map(shop => shop.id)
    const shopIdsToAdd = validShopIds.filter(
      validShopId => stylistShopIds.indexOf(validShopId) === -1,
    )
    const shopIdsToRemove = stylistShopIds.filter(
      ssid => validShopIds.indexOf(ssid) === -1,
    )

    return StylistRepository.updateStylist(id, query.name, shopIdsToAdd, shopIdsToRemove)
  },

  async deleteStylist(id) {
    const stylist = await StylistRepository.fetch(id)
    if (!stylist) {
      throw new NotFoundError()
    }
    return StylistRepository.deleteStylist(id)
  },

}

export default StylistService
