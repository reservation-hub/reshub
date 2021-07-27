const Joi = require('joi')

module.exports = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().allow('desc', 'asc'),
  filter: Joi.array().items(Joi.string()),
})
