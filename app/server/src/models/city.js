const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    prefecture: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Prefecture',
    }
  }
)

exports.City = mongoose.model('City', citySchema)