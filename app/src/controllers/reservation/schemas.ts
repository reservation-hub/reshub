import joi from 'joi'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = joi.object({
  page: joi.string().pattern(/^[0-9]+$/),
  order: joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const indexCalendarSchema = joi.object({
  year: joi.string().pattern(/^[12][09][0-9][0-9]$/).required(),
  month: joi.string().pattern(/^(1[0-2]|[1-9])$/).required(),
})

export const reservationUpsertSchema = joi.object({
  reservationDate:
    joi.string().pattern(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dZ$/).required(),
  stylistId: joi.number(),
  userId: joi.number().required(),
  menuId: joi.number().required(),
})
