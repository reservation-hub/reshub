import { StylistRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@lib/prisma'
import { reconstructStylist } from '@lib/prismaConverters/Stylist'

const StylistRepository: StylistRepositoryInterface = {
  async fetchShopStylist(shopId, stylistId) {
    const stylist = await prisma.stylist.findFirst({
      where: { id: stylistId, AND: { shopId } },
    })
    return stylist ? reconstructStylist(stylist) : null
  },

  async fetchStylistsByIds(ids) {
    const stylists = await prisma.stylist.findMany({
      where: { id: { in: ids } },
    })
    return stylists.map(reconstructStylist)
  },
}

export default StylistRepository
