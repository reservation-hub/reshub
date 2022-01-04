import joi from 'joi'
import date from '@joi/date'

const Joi = joi.extend(date)

export const reservationUpsertSchema = Joi.object({
  reservationDate: Joi.date().format('YYYY-MM-DD HH:mm:ss').utc().required(),
  menuId: Joi.number().required(),
})
