const Joi = require('joi')

exports.shopSchema = Joi.object({
  name: Joi.string().alphanum().required(),
  areaID: Joi.number().integer().required(),
  prefectureID: Joi.number().integer().required(),
  cityID: Joi.number().integer().required(),
})
