import { ScheduleDays } from '@entities/Common'
import Joi from 'joi'

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
  startTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
  endTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
})
