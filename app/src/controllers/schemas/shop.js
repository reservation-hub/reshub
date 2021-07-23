const Joi = require('joi')

exports.shopUpsertSchema = Joi.object({
  name: Joi.string().required(),
  areaID: Joi.number().integer().required(),
  prefectureID: Joi.number().integer().required(),
  cityID: Joi.number().integer().required(),
})
