const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    googleID: {
      type: String,
      required: true,
      trim: true,
    },
  }, {
    timestamps: true,
  }
)

exports.User = mongoose.model('User', userSchema)