import { LocationServiceInterface } from '@client/location/LocationController'
import { LocationRepository } from '@client/location/repositories/LocationRepository'
import { Area, City, Prefecture } from '@entities/Location'
import { NotFoundError } from '@errors/ServiceErrors'

export type LocationRepositoryInterface = {
  fetchAreas() : Promise<Area[]>
  fetchArea(areaId: number) : Promise<Area | null>
  fetchAreaPrefectures(areaId: number) : Promise<Prefecture[]>
  fetchPrefecture(prefectureId: number) : Promise<Prefecture | null>
  fetchPrefectureCities(prefectureId: number) : Promise<City[]>
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>
}

const LocationService: LocationServiceInterface = {
  async fetchAreas() {
    return LocationRepository.fetchAreas()
  },

  async fetchAreaWithPrefectures(areaId) {
    const area = await LocationRepository.fetchArea(areaId)
    if (!area) {
      throw new NotFoundError('Area does not exist')
    }
    const prefectures = await LocationRepository.fetchAreaPrefectures(area.id)
    return { ...area, prefectures }
  },

  async fetchPrefectureWithCities(prefectureId) {
    const prefecture = await LocationRepository.fetchPrefecture(prefectureId)
    if (!prefecture) {
      throw new NotFoundError('Prefecture does not exist')
    }
    const cities = await LocationRepository.fetchPrefectureCities(prefecture.id)
    return { ...prefecture, cities }
  },

}

export default LocationService
