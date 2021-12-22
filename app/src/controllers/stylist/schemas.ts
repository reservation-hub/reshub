import Joi from 'joi'
import { ScheduleDays, OrderBy } from '@entities/Common'

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
  startTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
  endTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
})
