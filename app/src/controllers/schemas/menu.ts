import Joi from 'joi'

export const menuItemUpsertSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
})
