const { Shop } = require('../models/shop')

module.exports = { 
  fetchByCount(count, populate = true) {
    const foreignKeys = populate ? ['area', 'prefecture', 'city'] : []
    return Shop.find().limit(parseInt(count)).populate(foreignKeys).exec()
  },
}