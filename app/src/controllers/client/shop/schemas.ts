import Joi from 'joi'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const searchByAreaSchema = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
  areaId: Joi.string().pattern(/^[0-9]+$/).required(),
  prefectureId: Joi.string().pattern(/^[0-9]+$/),
  cityId: Joi.string().pattern(/^[0-9]+$/),
})
