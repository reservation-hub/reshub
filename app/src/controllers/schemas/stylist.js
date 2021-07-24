const Joi = require('joi')

exports.stylistUpsertSchema = Joi.object({
  name: Joi.string().required(),
  shops: Joi.array().items(Joi.number()).required(),
  image: Joi.string().uri(),
})
