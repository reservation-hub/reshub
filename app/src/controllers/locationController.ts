import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import LocationService, { LocationQuery, LocationResponse } from '../services/LocationService'
import indexSchema from './schemas/indexSchema'
import { Area, Prefecture, City } from '../entities/Location'

export type LocationServiceInterface = {
  fetchAreasWithCount(query: LocationQuery): Promise<LocationResponse>,
  fetchArea(id: number): Promise<Area>,
  fetchPrefecturesWithCount(query: LocationQuery): Promise<LocationResponse>,
  fetchPrefecture(id: number): Promise<Prefecture>,
  fetchCitiesWithCount(query: LocationQuery): Promise<LocationResponse>,
  fetchCity(id: number): Promise<City>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const areaIndex = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const { data: values, totalCount } = await LocationService.fetchAreasWithCount(params)
  return res.send({ values, totalCount })
})

const showArea = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const area = await LocationService.fetchArea(id)
  return res.send(area)
})

const prefectureIndex = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const { data: values, totalCount } = await LocationService.fetchPrefecturesWithCount(params)
  return res.send({ values, totalCount })
})

const showPrefecture = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const prefecture = await LocationService.fetchPrefecture(id)
  return res.send(prefecture)
})

const cityIndex = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const { data: values, totalCount } = await LocationService.fetchCitiesWithCount(params)
  return res.send({ values, totalCount })
})

const showCity = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const city = await LocationService.fetchCity(id)
  return res.send(city)
})

export const areaController = Router()
export const prefectureController = Router()
export const cityController = Router()

areaController.get('/', roleCheck(['admin']), areaIndex)
areaController.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showArea)

prefectureController.get('/', roleCheck(['admin']), prefectureIndex)
prefectureController.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showPrefecture)

cityController.get('/', roleCheck(['admin']), cityIndex)
cityController.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showCity)
