const router = require('express').Router()
const eah = require('express-async-handler')
const ReservationRepository = require('../repositories/ReservationRepository')
const { reservationUpsertSchema } = require('./schemas/reservation')
const { parseIntIDMiddleware } = require('./lib/utils')
const indexSchema = require('./schemas/indexSchema')

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = eah(async (req, res, next) => {
  const { error, value: schemaValues } = indexSchema.validate(req.query, joiOptions)
  if (error) {
    return next({ code: 400, message: 'Invalid query values', error })
  }

  const {
    error: fetchReservationsError,
    value: reservations,
  } = await ReservationRepository.fetchAll(
    schemaValues.page,
    schemaValues.order,
    schemaValues.filter,
  )
  if (fetchReservationsError) {
    return next({ code: 500, message: 'Server error', error: fetchReservationsError })
  }

  const {
    error: reservationsCountError,
    value: reservationsCount,
  } = await ReservationRepository.totalCount(schemaValues.filter)
  if (reservationsCountError) {
    return next({ code: 500, message: 'Server error', error: reservationsCountError })
  }

  return res.send({ data: reservations, totalCount: reservationsCount })
})

const showReservation = eah(async (req, res, next) => {
  const { id } = res.locals
  const {
    error: reservationFetchError,
    value: reservation,
  } = await ReservationRepository.fetchReservation(id)
  if (reservationFetchError) {
    return next({ code: 500, message: 'Server error', error: reservationFetchError })
  }
  if (!reservation) {
    return next({ code: 404, message: 'Reservation Not Found' })
  }

  return res.send({ data: reservation })
})

const insertReservation = eah(async (req, res, next) => {
  const {
    error: reservationSchemaError,
    value: reservationValues,
  } = reservationUpsertSchema.validate(req.body, joiOptions)

  if (reservationSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: reservationSchemaError })
  }

  // TODO validate if shop, stylist, or user is valid
  const {
    error: insertReservationError,
    value: reservation,
  } = await ReservationRepository.insertReservation(
    reservationValues.reservationDate, reservationValues.shopID,
    reservationValues.stylistID, reservationValues.userID,
  )

  if (insertReservationError) {
    return next({ code: 400, message: 'Invalid input values', error: insertReservationError })
  }

  return res.send({ data: reservation })
})

router.get('/', index)
router.get('/:id', parseIntIDMiddleware, showReservation)
router.post('/', insertReservation)

module.exports = router
