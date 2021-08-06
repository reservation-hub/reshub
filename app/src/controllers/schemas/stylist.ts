import Joi from 'joi'

export const stylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  shopIDs: Joi.array().items(Joi.number()).required(),
})
