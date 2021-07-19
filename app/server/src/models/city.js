const mongoose = require('mongoose')

const { Schema } = mongoose

const mongoosePaginate = require('mongoose-paginate-v2')

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
    },
  },
)
citySchema.plugin(mongoosePaginate)
exports.City = mongoose.model('City', citySchema)
