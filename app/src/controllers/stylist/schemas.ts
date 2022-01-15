import joi from 'joi'
import { OrderBy } from '@request-response-types/Common'
import { ScheduleDays } from '@request-response-types/models/Common'

export const indexSchema = joi.object({
  page: joi.string().pattern(/^[0-9]+$/),
  order: joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const shopStylistUpsertSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().min(0).required(),
  days: joi.array().items(joi.string().valid(
    ScheduleDays.MONDAY,
    ScheduleDays.TUESDAY,
    ScheduleDays.WEDNESDAY,
    ScheduleDays.THURSDAY,
    ScheduleDays.FRIDAY,
    ScheduleDays.SATURDAY,
    ScheduleDays.SUNDAY,
  )).min(1).required(),
  startTime: joi.string().pattern(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d$/).required(),
  endTime: joi.string().pattern(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d$/).required(),
})
