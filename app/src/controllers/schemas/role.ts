import Joi from 'joi'

export const roleUpsertSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  slug: Joi.string().required(),
})
