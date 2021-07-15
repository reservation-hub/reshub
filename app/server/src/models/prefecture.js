const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MongoosePaging = require('mongo-cursor-pagination')
const { mongoosePlugin } = require('mongo-cursor-pagination/src');
const prefectureSchema = Schema(
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
    },
    area: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Area',
    },
  }
)
prefectureSchema.plugin(MongoosePaging.mongoosePlugin)

exports.Prefecture = mongoose.model('Prefecture', prefectureSchema)