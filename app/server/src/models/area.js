const mongoose = require('mongoose')
const Schema = mongoose.Schema

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

exports.areas = [
  {
    name: "北海道-東北",
    slug: "hokkaidou-touhoku"
  },
  {
    name: "関東",
    slug: "kantou"
  },
  {
    name: "中部",
    slug: "chuubu"
  },
  {
    name: "近畿",
    slug: "kinki"
  },
  {
    name: "中国",
    slug: "chuugoku"
  },
  {
    name: "四国",
    slug: "shikoku"
  },
  {
    name: "九州",
    slug: "kyuushuu"
  },
]

exports.Area = mongoose.model('Area', areaSchema)