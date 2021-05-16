const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
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
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Area'
    },
    prefecture: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Prefecture'
    },
    city: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'City'
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

exports.validationSchema = Joi.object({
  name: Joi.string().alphanum(),
  slug: Joi.string().alphanum(),
  area: Joi.objectId(),
  prefecture: Joi.objectId(),
  city: Joi.objectId(),
  brand: Joi.string(),
})

exports.Shop = mongoose.model('Shop', shopSchema)