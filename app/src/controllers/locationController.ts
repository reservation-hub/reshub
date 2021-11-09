import { Router } from 'express'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import LocationService from '../services/LocationService'
import indexSchema from './schemas/indexSchema'
import { Area, Prefecture, City } from '../entities/Location'
import { LocationQuery, LocationResponse } from '../request-response-types/Location'
import { CustomRequest } from './controller-adapter/Models/Request'
import ControllerAdapter from './controller-adapter'

export type LocationServiceInterface = {
  fetchAreasWithCount(query: LocationQuery): Promise<{ data: Area[], totalCount: number }>,
  fetchArea(id: number): Promise<Area>,
  fetchPrefecturesWithCount(query: LocationQuery): Promise<{ data: Prefecture[], totalCount: number}>,
  fetchPrefecture(id: number): Promise<Prefecture>,
  fetchCitiesWithCount(query: LocationQuery): Promise<{ data: City[], totalCount: number }>,
  fetchCity(id: number): Promise<City>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const areaIndex = async (req: CustomRequest) : Promise<LocationResponse> => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const { data: values, totalCount } = await LocationService.fetchAreasWithCount(params)
  return { values, totalCount }
}

const showArea = async (req: CustomRequest) : Promise<Area> => {
  const { id } = req.locals
  const area = await LocationService.fetchArea(id!)
  return area
}

const prefectureIndex = async (req: CustomRequest) : Promise<LocationResponse> => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const { data: values, totalCount } = await LocationService.fetchPrefecturesWithCount(params)
  return { values, totalCount }
}

const showPrefecture = async (req: CustomRequest) : Promise<Prefecture> => {
  const { id } = req.locals
  const prefecture = await LocationService.fetchPrefecture(id!)
  return prefecture
}

const cityIndex = async (req: CustomRequest) : Promise<LocationResponse> => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const { data: values, totalCount } = await LocationService.fetchCitiesWithCount(params)
  return { values, totalCount }
}

const showCity = async (req: CustomRequest) : Promise<City> => {
  const { id } = req.locals
  const city = await LocationService.fetchCity(id!)
  return city
}

export const areaController = Router()
export const prefectureController = Router()
export const cityController = Router()

areaController.get('/', roleCheck(['admin']), ControllerAdapter(areaIndex))
areaController.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, ControllerAdapter(showArea))

prefectureController.get('/', roleCheck(['admin']), ControllerAdapter(prefectureIndex))
prefectureController.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, ControllerAdapter(showPrefecture))

cityController.get('/', roleCheck(['admin']), ControllerAdapter(cityIndex))
cityController.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, ControllerAdapter(showCity))
