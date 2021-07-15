const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const Schema = mongoose.Schema
const MongoosePaging = require('mongo-cursor-pagination')
const { mongoosePlugin } = require('mongo-cursor-pagination/src');
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
    details: {
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
  name: Joi.string().alphanum().required(),
  slug: Joi.string().alphanum().required(),
  area: Joi.objectId().required(),
  prefecture: Joi.objectId().required(),
  city: Joi.objectId().required(),
  brand: Joi.string().required(),
  details: Joi.string().required(),
})

shopSchema.plugin(MongoosePaging.mongoosePlugin)
exports.Shop = mongoose.model('Shop', shopSchema)