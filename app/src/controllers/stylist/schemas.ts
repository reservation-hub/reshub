import joi from 'joi'
import date from '@joi/date'
import { OrderBy } from '@request-response-types/Common'
import { ScheduleDays } from '@request-response-types/models/Common'

const Joi = joi.extend(date)

export const indexSchema = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const shopStylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  days: Joi.array().items(Joi.string().valid(
    ScheduleDays.MONDAY,
    ScheduleDays.TUESDAY,
    ScheduleDays.WEDNESDAY,
    ScheduleDays.THURSDAY,
    ScheduleDays.FRIDAY,
    ScheduleDays.SATURDAY,
    ScheduleDays.SUNDAY,
  )).min(1).required(),
  startTime: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
  endTime: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
})
