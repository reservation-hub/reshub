import { LocationServiceInterface } from '@controllers/locationController'
import { LocationServiceInterface as DashboardControllerSocket } from '@controllers/dashboardController'
import { LocationRepository } from '@repositories/LocationRepository'
import { RoleSlug } from '@entities/Role'
import { ShopRepository } from '@repositories/ShopRepository'
import { Area, City, Prefecture } from '@entities/Location'
import { AuthorizationError, NotFoundError } from './Errors/ServiceError'

type fetchLocationNamesParams = {
  areaId: number
  prefectureId: number
  cityId: number
}

export type LocationRepositoryInterface = {
  fetchAreas() : Promise<Area[]>
  fetchArea(areaId: number) : Promise<Area | null>
  fetchAreaPrefectures(areaId: number) : Promise<Prefecture[]>
  fetchPrefecture(prefectureId: number) : Promise<Prefecture | null>
  fetchPrefectureCities(prefectureId: number) : Promise<City[]>
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>
  fetchLocationNamesOfIds(params: fetchLocationNamesParams[])
    : Promise<{
      areas: { id: number, name: string}[]
      prefectures: {id: number, name: string}[]
      cities: {id: number, name: string}[]
    }>
  }

const LocationService: LocationServiceInterface & DashboardControllerSocket = {
  async fetchAreas() {
    return LocationRepository.fetchAreas()
  },

  async fetchAreaWithPrefectures(areaId) {
    const area = await LocationRepository.fetchArea(areaId)
    if (!area) {
      console.error('Area does not exist')
      throw new NotFoundError()
    }
    const prefectures = await LocationRepository.fetchAreaPrefectures(area.id)
    return { ...area, prefectures }
  },

  async fetchPrefectureWithCities(prefectureId) {
    const prefecture = await LocationRepository.fetchPrefecture(prefectureId)
    if (!prefecture) {
      console.error('Prefecture does not exist')
      throw new NotFoundError()
    }
    const cities = await LocationRepository.fetchPrefectureCities(prefecture.id)
    return { ...prefecture, cities }
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
