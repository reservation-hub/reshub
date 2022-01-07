import Joi from 'joi'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const menuUpsertSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  duration: Joi.number().required(),
})
