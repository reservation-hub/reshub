const mongoose = require('mongoose')
const Schema = mongoose.Schema
const MongoosePaging = require('mongo-cursor-pagination')

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
citySchema.plugin(MongoosePaging.mongoosePlugin)
exports.City = mongoose.model('City', citySchema)