const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi')

const userSchema = Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    password: String,
    googleID: String,
    lineID: String,
    twitterID: String,
  }, {
    timestamps: true,
  }
)

exports.validationSchema = Joi.object({
  username: Joi.string().trim().alphanum().required(),
  password: Joi.string().trim().alphanum().required(),
  confirm: Joi.string().trim().alphanum().required(),
  email: Joi.string().email().trim().required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  googleID: Joi.string().trim(),
  lineID: Joi.string().trim(),
  twitterID: Joi.string().trim(),
})

exports.User = mongoose.model('User', userSchema)