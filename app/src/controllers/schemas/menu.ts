import Joi from 'joi'

export const menuUpsertSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
})
