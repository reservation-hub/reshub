const mongoose = require('mongoose')
const Schema = mongoose.Schema
const MongoosePaging = require('mongo-cursor-pagination')
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
areaSchema.plugin(MongoosePaging.mongoosePlugin)
exports.Area = mongoose.model('Area', areaSchema)
