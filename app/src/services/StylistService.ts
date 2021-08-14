import { Stylist } from '../entities/Stylist'
import StylistRepository from '../repositories/StylistRepository'
import { StylistServiceInterface } from '../controllers/stylistController'
import { ShopRepository } from '../repositories/ShopRepository'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type upsertStylistparams = {
  name: string,
  price: number,
  shopId: number,
}

export type StylistRepositoryInterface = {
  insertStylist(name: string, price: number, shopId: number): Promise<Stylist>,
  updateStylist(id: number, name: string, price: number, shopId: number)
  :Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
}

export type ShopRepositoryInterface = {
  fetchValidShopIds(shopIds: number[]): Promise<number[]>
}

const StylistService: StylistServiceInterface = {
  async fetchStylistsWithTotalCount(params) {
    const stylists = await StylistRepository.fetchAll(params)
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

  async insertStylist(params) {
    const shop = await ShopRepository.fetch(params.shopId)
    if (!shop) {
      throw new InvalidParamsError()
    }

    return StylistRepository.insertStylist(params.name, params.price, params.shopId)
  },

  async updateStylist({ id, params }) {
    const shop = await ShopRepository.fetch(params.shopId)
    if (!shop) {
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.fetch(id)
    if (!stylist) {
      throw new NotFoundError()
    }

    return StylistRepository.updateStylist(id, params.name, params.price, params.shopId)
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
