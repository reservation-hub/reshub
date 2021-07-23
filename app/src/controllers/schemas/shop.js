const Joi = require('joi')

exports.shopInsertSchema = Joi.object({
  name: Joi.string().required(),
  areaID: Joi.number().integer().required(),
  prefectureID: Joi.number().integer().required(),
  cityID: Joi.number().integer().required(),
})

exports.shopUpdateSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  areaID: Joi.number().integer().required(),
  prefectureID: Joi.number().integer().required(),
  cityID: Joi.number().integer().required(),
})
