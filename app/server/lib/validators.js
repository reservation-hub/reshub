const mongoose = require('mongoose')
const { Types: { ObjectId }} = mongoose

exports.schemaMiddleware = (validationSchema) => {
  return (req, res, next) => {
    validationSchema.validateAsync(req.body, {abortEarly: false})
    .then(validated => {
      next()
    })
    .catch(e => next(e))
  }
}

exports.idMiddleware = () => {
  return (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) return next({code: 404})
    return next()
  }
}