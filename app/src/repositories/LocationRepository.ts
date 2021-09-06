import prisma from './prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

import { Area, Prefecture, City } from '../entities/Location'
import { LocationRepositoryInterface } from '../services/ShopService'

export const isValidLocation = async (areaId: number, prefectureId: number, cityId: number):
Promise<boolean> => {
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
}

export const LocationRepository: LocationRepositoryInterface = { isValidLocation }

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
