const mongoose = require('mongoose')
const Schema = mongoose.Schema

const shopSchema = Schema(
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
      // type: Schema.Types.ObjectId,
      type: String,
      required: true,
      ref: 'Area'
    },
    prefec: {
      // type: Schema.Types.ObjectId,
      type: Number,
      required: true,
      ref: 'Prefec'
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    coupons: [{
      type: Schema.Types.ObjectId,
      required: true,
    }]
  }, {
    timestamps: true,
    strictQuery: true,
  }
)

exports.Shop = mongoose.model('Shop', shopSchema)