import { LocationServiceInterface } from '@controllers/locationController'
import {
  AreaRepository, CityRepository, PrefectureRepository,
} from '../repositories/LocationRepository'
import { NotFoundError } from './Errors/ServiceError'

export type LocationQuery = {
  page: number,
  order: any,
  limit: number,
}

const LocationService: LocationServiceInterface = {

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

}

export default LocationService
