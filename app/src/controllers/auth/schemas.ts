import Joi from 'joi'

export const localStrategySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
})

export const googleSchema = Joi.object({
  provider: Joi.string().valid('google').required(),
  tokenId: Joi.string().required(),
})
