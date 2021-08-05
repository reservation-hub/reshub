const Joi = require('joi')

exports.userSchema = Joi.object({
  username: Joi.string().trim().alphanum(),
  password: Joi.string().trim().alphanum().required(),
  email: Joi.string().email().trim().required(),
  googleID: Joi.string().trim(),
  lineID: Joi.string().trim(),
  twitterID: Joi.string().trim(),
  roles: Joi.array().items(Joi.string()),
})
