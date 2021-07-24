const Joi = require('joi')

exports.roleUpsertSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  slug: Joi.string().required(),
})
