const { crudController } = require('./crudController')

exports.index = (req, res, next) => {
  crudController.index(req, res, next, { Model: Prefecture })
}

exports.show = (req, res, next) => {
  const { id } = req.params
  crudController.show(req, res, next, { Model: Prefecture, id })
}

exports.insert = (req, res, next) => {
  const prefecture = new Prefecture(req.body)
  crudController.insert(req, res, next, { Model: Prefecture })
}

exports.update = async (req, res, next) => {
  const { id } = req.params
  crudController.update(req, res, next, { Model: Prefecture, id, params: req.body })
}

exports.delete = (req, res, next) => {
  const { id } = req.params
  crudController.delete(req, res, next, { Model: Prefecture, id })
}

exports.parse = (req, res, next) => {
  const { prefectures } = require('../models/prefecture')
  const parsedPrefectures = Object.entries(prefectures).map(([key, val]) => {
    return val
  })
  return res.send(parsedPrefectures)
}