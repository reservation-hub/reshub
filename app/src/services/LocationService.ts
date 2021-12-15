import { LocationServiceInterface } from '@controllers/locationController'
import { LocationServiceInterface as DashboardControllerSocket } from '@controllers/dashboardController'
import {
  AreaRepository, CityRepository, LocationRepository, PrefectureRepository,
} from '@repositories/LocationRepository'
import { RoleSlug } from '@entities/Role'
import { ShopRepository } from '@repositories/ShopRepository'
import { AuthorizationError, NotFoundError } from './Errors/ServiceError'

export type LocationQuery = {
  page: number,
  order: any,
  limit: number,
}

type fetchLocationNamesParams = {
  areaId: number
  prefectureId: number
  cityId: number
}
export type LocationRepositoryInterface = {
  fetchLocationNamesOfIds(params: fetchLocationNamesParams[])
    : Promise<{
      areas: { id: number, name: string}[]
      prefectures: {id: number, name: string}[]
      cities: {id: number, name: string}[]
    }>
}

const LocationService: LocationServiceInterface & DashboardControllerSocket = {

  async fetchAreasWithCount(query) {
    const areaCount = await AreaRepository.totalCount()
    const areas = await AreaRepository.fetchAll(query)
    return { data: areas, totalCount: areaCount }
  },

  async fetchArea(id) {
    const area = await AreaRepository.fetch(id)
    if (!area) {
      throw new NotFoundError()
    }
    return area
  },

  async fetchPrefecturesWithCount(query) {
    const prefectureCount = await PrefectureRepository.totalCount()
    const prefectures = await PrefectureRepository.fetchAll(query)
    return { data: prefectures, totalCount: prefectureCount }
  },

  async fetchPrefecture(id) {
    const prefecture = await PrefectureRepository.fetch(id)
    if (!prefecture) {
      throw new NotFoundError()
    }
    return prefecture
  },

  async fetchCitiesWithCount(query) {
    const cityCount = await CityRepository.totalCount()
    const cities = await CityRepository.fetchAll(query)
    return { data: cities, totalCount: cityCount }
  },

  async fetchCity(id) {
    const city = await CityRepository.fetch(id)
    if (!city) {
      throw new NotFoundError()
    }
    return city
  },

  async fetchLocationNamesOfShops(user, params) {
    if (user.role.slug === RoleSlug.SHOP_STAFF) {
      params.forEach(async p => {
        if (!await ShopRepository.shopIsOwnedByUser(user.id, p.shopId)) {
          console.error('Shop is not owned by user')
          throw new AuthorizationError()
        }
      })
    }
    const locations = params.map(l => ({
      areaId: l.areaId,
      prefectureId: l.prefectureId,
      cityId: l.cityId,
    }))
    const locationCombinations = await LocationRepository.fetchLocationNamesOfIds(locations)
    return params.map(p => ({
      shopId: p.shopId,
      areaName: locationCombinations.areas.find(a => a.id === p.areaId)!.name,
      prefectureName: locationCombinations.prefectures.find(pr => pr.id === p.prefectureId)!.name,
      cityName: locationCombinations.cities.find(c => c.id === p.cityId)!.name,
    }))
  },

}

export default LocationService
