import Joi from 'joi'
import { ScheduleDays } from '@request-response-types/models/Common'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const shopUpsertSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().allow('', null),
  phoneNumber: Joi.string().allow('', null),
  areaId: Joi.number().integer().required(),
  prefectureId: Joi.number().integer().required(),
  cityId: Joi.number().integer().required(),
  details: Joi.string().allow('', null),
  days: Joi.array().items(Joi.string().valid(
    ScheduleDays.MONDAY,
    ScheduleDays.TUESDAY,
    ScheduleDays.WEDNESDAY,
    ScheduleDays.THURSDAY,
    ScheduleDays.FRIDAY,
    ScheduleDays.SATURDAY,
    ScheduleDays.SUNDAY,
  )).min(1).required(),
  seats: Joi.number().required(),
  startTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
  endTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
})

export const searchSchema = Joi.object({
  keyword: Joi.string().required(),
})
