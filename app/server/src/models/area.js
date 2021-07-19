const mongoose = require('mongoose')

const { Schema } = mongoose
const mongoosePaginate = require('mongoose-paginate-v2')

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
    },
  },
  {
    strictQuery: true,
  },
)
areaSchema.plugin(mongoosePaginate)
exports.Area = mongoose.model('Area', areaSchema)
