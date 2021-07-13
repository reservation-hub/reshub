const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roleSchema = Schema(
  {
    name: String,
    description: String,
  }
)

exports.Role = mongoose.model('Role', roleSchema)