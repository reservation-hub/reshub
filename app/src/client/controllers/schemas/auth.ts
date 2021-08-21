import Joi from 'joi'

export const localStrategySchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(8).required(),
})
