import asyncHandler from 'express-async-handler'
import { stylistUpsertSchema } from './schemas/stylist'
import indexSchema from './schemas/indexSchema'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { Stylist } from '../entities/Stylist'
import StylistService, { upsertStylistQuery } from '../services/StylistService'

// const ShopRepository = require('../repositories/ShopRepository')

export type StylistServiceInterface = {
  fetchStylistsWithTotalCount(query: fetchModelsWithTotalCountQuery):
    Promise<{ data: Stylist[], totalCount: number }>,
  fetchStylist(id: number): Promise<Stylist>,
  insertStylist(query: upsertStylistQuery): Promise<Stylist>,
  updateStylist(id: number, query: upsertStylistQuery): Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
  const stylistsWithCount = await StylistService.fetchStylistsWithTotalCount(schemaValues)
  return res.send(stylistsWithCount)
})

export const showStylist = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const stylist = await StylistService.fetchStylist(id)
  return res.send({ data: stylist })
})

export const insertStylist = asyncHandler(async (req, res) => {
  const schemaValues = await stylistUpsertSchema.validateAsync(req.body, joiOptions)
  const stylist = await StylistService.insertStylist(schemaValues)
  return res.send({ data: stylist })
})

export const updateStylist = asyncHandler(async (req, res) => {
  const schemaValues = await stylistUpsertSchema.validateAsync(req.body, joiOptions)
  const { id } = res.locals
  const stylist = await StylistService.updateStylist(id, schemaValues)
  return res.send({ data: stylist })
})

export const deleteStylist = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await StylistService.deleteStylist(id)
  return res.send({ data: { message: 'Stylist deleted' } })
})
