import Joi from 'joi'

export const stylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  shopIds: Joi.array().items(Joi.number()).required(),
})
