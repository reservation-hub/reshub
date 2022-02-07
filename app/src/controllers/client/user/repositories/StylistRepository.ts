import { StylistRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'

const ReviewRepository: StylistRepositoryInterface = {
  async fetchStylistNamesByIds(stylistId) {
    const stylist = await prisma.stylist.findMany({
      where: { id: { in: stylistId } },
    })
    return stylist.map(s => ({
      stylistId: s.id,
      stylistName: s.name,
    }))
  },
}

export default ReviewRepository
