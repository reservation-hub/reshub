const Joi = require('joi')

exports.userInsertSchema = Joi.object({
  username: Joi.string().trim().alphanum(),
  password: Joi.string().trim().alphanum().required(),
  confirm: Joi.string().trim().alphanum().required(),
  email: Joi.string().email().trim().required(),
  roles: Joi.array().items(Joi.number()).required(),
})

exports.userUpdateSchema = Joi.object({
  username: Joi.string().trim().alphanum(),
  email: Joi.string().email().trim().required(),
  roles: Joi.array().items(Joi.number()).required(),
})

exports.userOAuthIDUpsertSchema = Joi.object({
  googleID: Joi.string().trim(),
  lineID: Joi.string().trim(),
  twitterID: Joi.string().trim(),
})

exports.userProfileUpsertSchema = Joi.object({
  firstNameKanji: Joi.string().trim().required(),
  lastNameKanji: Joi.string().trim().required(),
  firstNameKana: Joi.string().trim().required(),
  lastNameKana: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim(),
  address: Joi.string().trim(),
  gender: Joi.string().valid('0', '1'),
  birthday: Joi.date(),
})
