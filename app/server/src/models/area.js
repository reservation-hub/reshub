const mongoose = require('mongoose')
const Schema = mongoose.Schema

const areaSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    strictQuery: true,
  }
)

exports.Area = mongoose.model('Area', areaSchema)