const mongoose = require('mongoose')

const { Schema } = mongoose
const Joi = require('joi')

const mongoosePaginate = require('mongoose-paginate-v2')

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
    roles: [
      { type: Schema.Types.ObjectId, ref: 'Role' },
    ],
  }, {
    timestamps: true,
  },
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
  roles: Joi.array().items(Joi.string()),
})
userSchema.plugin(mongoosePaginate)
exports.User = mongoose.model('User', userSchema)
