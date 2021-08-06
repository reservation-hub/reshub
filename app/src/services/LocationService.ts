import { LocationServiceInterface } from '../controllers/locationController'
import { Area, Prefecture, City } from '../entities/Location'

import {
  AreaRepository, CityRepository, PrefectureRepository,
} from '../repositories/LocationRepository'

export type LocationQuery = {
  page: number,
  order: any,
}

export type LocationResponse = { data: Area[] | Prefecture[] | City[], totalCount: number }

export const fetchAreasWithCount = async (query: LocationQuery) : Promise<LocationResponse> => {
  const areaCount = await AreaRepository.totalCount()
  const areas = await AreaRepository.fetchAll(query.page, query.order)
  return { data: areas, totalCount: areaCount }
}

export const fetchPrefecturesWithCount = async (query: LocationQuery) : Promise<LocationResponse> => {
  const prefectureCount = await PrefectureRepository.totalCount()
  const prefectures = await PrefectureRepository.fetchAll(query.page, query.order)
  return { data: prefectures, totalCount: prefectureCount }
}

export const fetchCitiesWithCount = async (query: LocationQuery) : Promise<LocationResponse> => {
  const cityCount = await CityRepository.totalCount()
  const cities = await CityRepository.fetchAll(query.page, query.order)
  return { data: cities, totalCount: cityCount }
}

const LocationService: LocationServiceInterface = {
  fetchAreasWithCount,
  fetchPrefecturesWithCount,
  fetchCitiesWithCount,
}

export default LocationService
