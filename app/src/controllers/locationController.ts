import LocationService from '../services/LocationService'
import indexSchema from './schemas/indexSchema'
import { Area, Prefecture, City } from '../entities/Location'
import { LocationQuery } from '../request-response-types/Location'
import { AreaControllerInterface, CityControllerInterface, PrefectureControllerInterface }
  from '../controller-adapter/Location'

export type LocationServiceInterface = {
  fetchAreasWithCount(query: LocationQuery): Promise<{ data: Area[], totalCount: number }>,
  fetchArea(id: number): Promise<Area>,
  fetchPrefecturesWithCount(query: LocationQuery): Promise<{ data: Prefecture[], totalCount: number}>,
  fetchPrefecture(id: number): Promise<Prefecture>,
  fetchCitiesWithCount(query: LocationQuery): Promise<{ data: City[], totalCount: number }>,
  fetchCity(id: number): Promise<City>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const AreaController : AreaControllerInterface = {
  async areaIndex(query) {
    const params = await indexSchema.validateAsync(query, joiOptions)
    const { data: values, totalCount } = await LocationService.fetchAreasWithCount(params)
    return { values, totalCount }
  },

  async showArea(id) {
    const area = await LocationService.fetchArea(id)
    return area
  },
}

export const PrefectureController : PrefectureControllerInterface = {
  async prefectureIndex(query) {
    const params = await indexSchema.validateAsync(query, joiOptions)
    const { data: values, totalCount } = await LocationService.fetchPrefecturesWithCount(params)
    return { values, totalCount }
  },

  async showPrefecture(id) {
    const prefecture = await LocationService.fetchPrefecture(id)
    return prefecture
  },
}

export const CityController : CityControllerInterface = {
  async cityIndex(query) {
    const params = await indexSchema.validateAsync(query, joiOptions)
    const { data: values, totalCount } = await LocationService.fetchCitiesWithCount(params)
    return { values, totalCount }
  },

  async showCity(id) {
    const city = await LocationService.fetchCity(id)
    return city
  },
}
