const { Area } = require('../models/area')

module.exports = {
  fetchBySlug(slug) {
    return Area.findOne({slug}).orFail().exec()
  }
}