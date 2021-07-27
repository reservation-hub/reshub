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
    error: prefectureCountError,
    value: prefectureCount,
  } = await LocationRepository.fetchPrefectureCount(schemaValues.filter)
  if (prefectureCountError) {
    return next({ code: 500, message: 'Server error', error: prefectureCountError })
  }

  const {
    error: prefectureFetchError,
    value: prefectures,
  } = await LocationRepository.fetchAllPrefectures(
    schemaValues.page,
    schemaValues.order,
    schemaValues.filter,
  )

  if (prefectureFetchError) {
    return next({ code: 500, message: 'Server error', error: prefectureFetchError })
  }

  return res.send({ data: prefectures, totalCount: prefectureCount })
})

router.get('/', index)

module.exports = router
