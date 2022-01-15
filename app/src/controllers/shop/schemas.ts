import joi from 'joi'
import { ScheduleDays } from '@request-response-types/models/Common'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = joi.object({
  page: joi.string().pattern(/^[0-9]+$/),
  order: joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const shopUpsertSchema = joi.object({
  name: joi.string().required(),
  address: joi.string().allow('', null),
  phoneNumber: joi.string().allow('', null),
  areaId: joi.number().integer().required(),
  prefectureId: joi.number().integer().required(),
  cityId: joi.number().integer().required(),
  details: joi.string().allow('', null),
  days: joi.array().items(joi.string().valid(
    ScheduleDays.MONDAY,
    ScheduleDays.TUESDAY,
    ScheduleDays.WEDNESDAY,
    ScheduleDays.THURSDAY,
    ScheduleDays.FRIDAY,
    ScheduleDays.SATURDAY,
    ScheduleDays.SUNDAY,
  )).min(1).required(),
  seats: joi.number().required(),
  startTime: joi.string()
    .pattern(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dZ$/).required(),
  endTime: joi.string()
    .pattern(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dZ$/).required(),
})

export const searchSchema = joi.object({
  keyword: joi.string().required(),
})
