import joi from 'joi'
import date from '@joi/date'

const Joi = joi.extend(date)

export const reservationUpsertSchema = Joi.object({
  reservationDate: Joi.date().format('YYYY-MM-DD').utc().required(),
  shopID: Joi.number().required(),
  stylistID: Joi.number().required(),
  userID: Joi.number().required(),
})
