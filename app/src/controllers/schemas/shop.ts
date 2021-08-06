import Joi from 'joi'

export const shopUpsertSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().allow('', null),
  phoneNumber: Joi.string().allow('', null),
  areaID: Joi.number().integer().required(),
  prefectureID: Joi.number().integer().required(),
  cityID: Joi.number().integer().required(),
})
