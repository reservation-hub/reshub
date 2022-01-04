import { StylistRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@/prisma'

const StylistRepository: StylistRepositoryInterface = {
  async fetchShopStylistIds(shopId) {
    return (await prisma.stylist.findMany({
      where: { shopId },
    })).map(s => s.id)
  },
}

export default StylistRepository
