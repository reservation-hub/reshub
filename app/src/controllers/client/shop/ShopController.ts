import ShopService from '@client/shop/services/ShopService'
import { Shop } from '@entities/Shop'
import { UserForAuth } from '@entities/User'
import { OrderBy } from '@entities/Common'
import { ShopControllerInterface } from '@/controller-adapter/client/Shop'
import { indexSchema } from './schemas'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(user: UserForAuth, page?: number, order?: OrderBy)
    : Promise<{ shops: Shop[], totalCount: number }>
}

const joiOptions = { abortEarly: false, stripUnknown: true }
const ShopController: ShopControllerInterface = {
  async index(user, query) {
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { shops, totalCount } = await ShopService.fetchShopsWithTotalCount(user, page, order)
    const values = shops.map(s => ({
      id: s.id,
      name: s.name,
      phoneNumber: s.phoneNumber,
      address: s.address,
      prefectureName: s.prefecture.name,
      cityName: s.city.name,
    }))
    return { values, totalCount }
  },
}

export default ShopController
