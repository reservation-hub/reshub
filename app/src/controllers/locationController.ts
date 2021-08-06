import asyncHandler from 'express-async-handler'
import LocationService, { LocationQuery, LocationResponse } from '../services/LocationService'
import indexSchema from './schemas/indexSchema'

export type LocationServiceInterface = {
  fetchAreasWithCount(query: LocationQuery): Promise<LocationResponse>,
  fetchPrefecturesWithCount(query: LocationQuery): Promise<LocationResponse>,
  fetchCitiesWithCount(query: LocationQuery): Promise<LocationResponse>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const areaIndex = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
  const value = await LocationService.fetchAreasWithCount(schemaValues)
  return res.send({ data: value })
})

export const prefectureIndex = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
  const value = await LocationService.fetchPrefecturesWithCount(schemaValues)
  return res.send({ data: value })
})

export const cityIndex = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
  const value = await LocationService.fetchCitiesWithCount(schemaValues)
  return res.send({ data: value })
})
