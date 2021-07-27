const router = require('express').Router()
const eah = require('express-async-handler')
const LocationRepository = require('../repositories/LocationRepository')
const indexSchema = require('./schemas/indexSchema')

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = eah(async (req, res, next) => {
  const {
    error: schemaError,
    value: schemaValues,
  } = indexSchema.validate(req.query, joiOptions)
  if (schemaError) {
    return next({ code: 400, message: 'Invalid query values', error: schemaError })
  }

  const {
    error: cityCountError,
    value: cityCount,
  } = await LocationRepository.fetchCityCount(schemaValues.filter)
  if (cityCountError) {
    return next({ code: 500, message: 'Server error', error: cityCountError })
  }

  const {
    error: cityFetchError,
    value: cities,
  } = await LocationRepository.fetchAllCities(
    schemaValues.page,
    schemaValues.order,
    schemaValues.filter,
  )

  if (cityFetchError) {
    return next({ code: 500, message: 'Server error', error: cityFetchError })
  }

  return res.send({ data: cities, totalCount: cityCount })
})

router.get('/', index)

module.exports = router
