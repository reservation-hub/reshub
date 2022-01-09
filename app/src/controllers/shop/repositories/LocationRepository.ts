import { LocationRepositoryInterface } from '@shop/services/ShopService'
import prisma from '@/prisma'

const LocationRepository: LocationRepositoryInterface = {
  async isValidLocation(areaId, prefectureId, cityId) {
    const count: number = await prisma.city.count({
      where: {
        prefecture: {
          id: prefectureId,
          area: { id: areaId },
        },
        id: cityId,
      },
    })
    return count !== 0
  },

}

export default LocationRepository
