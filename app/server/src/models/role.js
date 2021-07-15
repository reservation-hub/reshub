const mongoose = require('mongoose')

const { Schema } = mongoose

const roleSchema = Schema(
  {
    name: String,
    description: String,
  },
)

exports.Role = mongoose.model('Role', roleSchema)
