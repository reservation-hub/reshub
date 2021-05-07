const { Shop }= require('../models/shop')
const { crudController } = require('./crudController')

exports.index = (req, res, next) => {
  crudController.index(req, res, next, { Model: Shop })
}

exports.show = (req, res, next) => {
  const { id } = req.params
  crudController.show(req, res, next, { Model: Shop, id })
}

exports.insert = (req, res, next) => {
  const shop = new Shop(req.body)
  crudController.insert(req, res, next, { Model: shop })
}

exports.update = async (req, res, next) => {
  const { id } = req.params
  crudController.update(req, res, next, { Model: Shop, id, params: req.body })
}

exports.delete = (req, res, next) => {
  const { id } = req.params
  crudController.delete(req, res, next, { Model: Shop, id })
}