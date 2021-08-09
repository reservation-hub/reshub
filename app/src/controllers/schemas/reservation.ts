import joi from 'joi'
import date from '@joi/date'

const Joi = joi.extend(date)

export const reservationUpsertSchema = Joi.object({
  reservationDate: Joi.date().format('YYYY-MM-DD').utc().required(),
  shopId: Joi.number().required(),
  stylistId: Joi.number().required(),
  userId: Joi.number().required(),
})