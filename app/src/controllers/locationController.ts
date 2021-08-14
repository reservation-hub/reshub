import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { roleCheck } from '../routes/utils'
import LocationService, { LocationQuery, LocationResponse } from '../services/LocationService'
import indexSchema from './schemas/indexSchema'

export type LocationServiceInterface = {
  fetchAreasWithCount(query: LocationQuery): Promise<LocationResponse>,
  fetchPrefecturesWithCount(query: LocationQuery): Promise<LocationResponse>,
  fetchCitiesWithCount(query: LocationQuery): Promise<LocationResponse>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const areaIndex = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const value = await LocationService.fetchAreasWithCount(params)
  return res.send(value)
})

const prefectureIndex = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const value = await LocationService.fetchPrefecturesWithCount(params)
  return res.send(value)
})

const cityIndex = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const value = await LocationService.fetchCitiesWithCount(params)
  return res.send(value)
})

export const areaController = Router().get('/', roleCheck(['admin']), areaIndex)
export const prefectureController = Router().get('/', roleCheck(['admin']), prefectureIndex)
export const cityController = Router().get('/', roleCheck(['admin']), cityIndex)
