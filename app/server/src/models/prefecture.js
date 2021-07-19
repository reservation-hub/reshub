const mongoose = require('mongoose')

const { Schema } = mongoose

const mongoosePaginate = require('mongoose-paginate-v2')

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
  },
)
prefectureSchema.plugin(mongoosePaginate)

exports.Prefecture = mongoose.model('Prefecture', prefectureSchema)
