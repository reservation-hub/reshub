import Joi from 'joi'

export default Joi.object({
  provider: Joi.string().valid('google').required(),
  tokenID: Joi.string().required(),
})
