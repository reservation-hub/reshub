const Joi = require('joi')

exports.userInsertSchema = Joi.object({
  username: Joi.string().trim().alphanum().allow('', null),
  password: Joi.string().trim().alphanum().required(),
  confirm: Joi.string().trim().alphanum().required(),
  email: Joi.string().email().trim().required(),
  roles: Joi.array().items(Joi.number()).required(),
})

exports.userUpdateSchema = Joi.object({
  username: Joi.string().trim().alphanum().allow('', null),
  email: Joi.string().email().trim().required(),
  roles: Joi.array().items(Joi.number()).required(),
})

exports.userOAuthIDUpsertSchema = Joi.object({
  googleID: Joi.string().trim().allow('', null),
  lineID: Joi.string().trim().allow('', null),
  twitterID: Joi.string().trim().allow('', null),
})

exports.userProfileUpsertSchema = Joi.object({
  firstNameKanji: Joi.string().trim().required(),
  lastNameKanji: Joi.string().trim().required(),
  firstNameKana: Joi.string().trim().required(),
  lastNameKana: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim().allow('', null),
  address: Joi.string().trim().allow('', null),
  gender: Joi.string().valid('0', '1').allow('', null),
  birthday: Joi.date().allow(null),
})
