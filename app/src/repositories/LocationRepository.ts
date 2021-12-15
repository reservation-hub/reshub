import { Area, Prefecture, City } from '@entities/Location'
import { LocationRepositoryInterface } from '@services/ShopService'
import { LocationRepositoryInterface as LocationServiceSocket } from '@services/LocationService'
import prisma from './prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

export const LocationRepository: LocationRepositoryInterface & LocationServiceSocket = {
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
}

export const AreaRepository:CommonRepositoryInterface<Area> = {
  async fetchAll({ page = 1, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    return prisma.area.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
  },
  async totalCount() {
    return prisma.area.count()
  },
  async fetch(id) {
    return prisma.area.findUnique({
      where: { id },
      include: {
        prefectures: true,
      },
    })
  },
}

export const PrefectureRepository:CommonRepositoryInterface<Prefecture> = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    return prisma.prefecture.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
  },
  async totalCount() {
    return prisma.prefecture.count()
  },
  async fetch(id) {
    return prisma.prefecture.findUnique({
      where: { id },
      include: {
        cities: true,
      },
    })
  },
}

export const CityRepository:CommonRepositoryInterface<City> = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    return prisma.city.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
  },
  async totalCount() {
    return prisma.city.count()
  },
  async fetch(id) {
    return prisma.city.findUnique({
      where: { id },
    })
  },
}
