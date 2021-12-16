import { LocationRepositoryInterface } from '@services/LocationService'
import prisma from './prisma'

export const LocationRepository: LocationRepositoryInterface = {
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

  async fetchLocationNamesOfIds(params) {
    const areas = await prisma.area.findMany({
      where: { id: { in: params.map(p => p.areaId) } },
      select: { id: true, name: true },
    })

    const prefectures = await prisma.prefecture.findMany({
      where: { id: { in: params.map(p => p.prefectureId) } },
      select: { id: true, name: true },
    })

    const cities = await prisma.city.findMany({
      where: { id: { in: params.map(p => p.cityId) } },
      select: { id: true, name: true },
    })

    return { areas, prefectures, cities }
  },

  async fetchAreas() {
    return prisma.area.findMany()
  },

  async fetchArea(areaId) {
    return prisma.area.findUnique({
      where: { id: areaId },
    })
  },

  async fetchAreaPrefectures(areaId) {
    return prisma.prefecture.findMany({
      where: { areaId },
    })
  },

  async fetchPrefecture(prefectureId) {
    return prisma.prefecture.findUnique({
      where: { id: prefectureId },
    })
  },

  async fetchPrefectureCities(prefectureId) {
    return prisma.city.findMany({
      where: { prefectureId },
    })
  },

}
