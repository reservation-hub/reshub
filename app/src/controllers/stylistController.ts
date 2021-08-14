import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { stylistUpsertSchema } from './schemas/stylist'
import indexSchema from './schemas/indexSchema'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { Stylist } from '../entities/Stylist'
import StylistService from '../services/StylistService'
import { insertStylistQuery, updateStylistQuery } from '../request-response-types/StylistService'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'

export type StylistServiceInterface = {
  fetchStylistsWithTotalCount(query: fetchModelsWithTotalCountQuery):
    Promise<{ data: Stylist[], totalCount: number }>,
  fetchStylist(id: number): Promise<Stylist>,
  insertStylist(query: insertStylistQuery): Promise<Stylist>,
  updateStylist(query: updateStylistQuery): Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const stylistsWithCount = await StylistService.fetchStylistsWithTotalCount(params)
  return res.send(stylistsWithCount)
})

export const showStylist = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const stylist = await StylistService.fetchStylist(id)
  return res.send(stylist)
})

export const insertStylist = asyncHandler(async (req, res) => {
  const params = await stylistUpsertSchema.validateAsync(req.body, joiOptions)
  const stylist = await StylistService.insertStylist(params)
  return res.send(stylist)
})

export const updateStylist = asyncHandler(async (req, res) => {
  const params = await stylistUpsertSchema.validateAsync(req.body, joiOptions)
  const { id } = res.locals
  const stylist = await StylistService.updateStylist({ id, params })
  return res.send(stylist)
})

export const deleteStylist = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await StylistService.deleteStylist(id)
  return res.send({ message: 'Stylist deleted' })
})

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showStylist)
routes.post('/', roleCheck(['admin']), insertStylist)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateStylist)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteStylist)

export default routes
