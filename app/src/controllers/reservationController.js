const router = require('express').Router()
const eah = require('express-async-handler')
const ReservationRepository = require('../repositories/reservationRepository')
const { reservationSchema } = require('./schemas/reservation')
const { viewController } = require('./lib/viewController')

const include = {
  area: true,
  prefecture: true,
  city: true,
}
const manyToMany = model => ({ ...model, roles: model.roles.map(role => role.role) })

const joiOptions = { abortEarly: false, stripUnknown: true }

const insertReservation = eah(async (req, res, next) => {
  const {
    error: reservationSchemaError,
    value: reservationValues,
  } = reservationSchema.validate(req.body, joiOptions)

  if (reservationSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: reservationSchemaError })
  }

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

router.get('/', viewController.index('user', include, manyToMany))
router.get('/:id', viewController.show('user', include, manyToMany))
router.post('/', insertReservation)

module.exports = router
