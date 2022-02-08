import { StylistRepositoryInterface } from '@reservation/services/ReservationService'
import prisma from '@lib/prisma'
import { reconstructStylist } from '@lib/prismaConverters/Stylist'

export const StylistRepository: StylistRepositoryInterface = {

  async fetchShopStylist(shopId, stylistId) {
    const stylist = await prisma.stylist.findFirst({
      where: { id: stylistId, AND: { shopId } },
    })
    return stylist ? reconstructStylist(stylist) : null
  },
  async fetchStylistsByIds(stylistIds) {
    const stylists = await prisma.stylist.findMany({
      where: { id: { in: stylistIds } },
    })
    return stylists.map(reconstructStylist)
  },

  async fetchStylistIdsByShopId(shopId) {
    return (await prisma.stylist.findMany({
      where: { shopId },
    })).map(s => s.id)
  },

}

export default StylistRepository
