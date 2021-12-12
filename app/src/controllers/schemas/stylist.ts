import Joi from 'joi'

export const stylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  shopId: Joi.number().required(),
  price: Joi.number().min(0).required(),
})

export const shopStylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  days: Joi.array().items(Joi.number().valid(0, 1, 2, 3, 4, 5, 6)).min(1).required(),
  startTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
  endTime: Joi.string().pattern(/^(?:([01]?\d|2[0-3]):)?([0-5]?\d)$/).required(),
})
