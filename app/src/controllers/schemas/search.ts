import Joi from 'joi'

export const searchSchema = Joi.object({
  keyword: Joi.string().required(),
})
