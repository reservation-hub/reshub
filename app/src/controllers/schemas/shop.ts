import Joi from 'joi'

export const shopUpsertSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().allow('', null),
  phoneNumber: Joi.string().allow('', null),
  areaId: Joi.number().integer().required(),
  prefectureId: Joi.number().integer().required(),
  cityId: Joi.number().integer().required(),
  details: Joi.string().allow('', null),
  days: Joi.array().items(Joi.number().valid(0, 1, 2, 3, 4, 5, 6)).min(1).required(),
  startTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
  endTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
})
