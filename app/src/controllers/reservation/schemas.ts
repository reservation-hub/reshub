import joi from 'joi'
import date from '@joi/date'
import { OrderBy } from '@entities/Common'

const Joi = joi.extend(date)

export const indexSchema = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const indexCalendarSchema = Joi.object({
  year: Joi.string().pattern(/^[12][09][0-9][0-9]$/).required(),
  month: Joi.string().pattern(/^(1[0-2]|[1-9])$/).required(),
})

export const reservationUpsertSchema = Joi.object({
  reservationDate: Joi.date().format('YYYY-MM-DD HH:mm:ss').utc().required(),
  stylistId: Joi.number(),
  userId: Joi.number().required(),
  menuId: Joi.number().required(),
})
