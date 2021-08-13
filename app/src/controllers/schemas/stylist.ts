import Joi from 'joi'

export const stylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  shopId: Joi.number().required(),
  price: Joi.number().min(0).required(),
})

export const shopStylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
})
