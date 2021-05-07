const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = Schema(
  {
    name: String,
    prefecture: String
  }
)

exports.City = mongoose.model('City', citySchema)