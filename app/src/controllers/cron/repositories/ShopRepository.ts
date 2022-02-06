import { ShopRepositoryInterface } from '@cron/services/ShopService'
import setPopularShops from '@lib/PopularShopSetter'

const ShopRepository: ShopRepositoryInterface = {
  setPopularShops,
}

export default ShopRepository
