import asyncHandler from 'express-async-handler'
// import ReservationService from '../services/ReservationService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
// import { reservationUpsertSchema } from './schemas/reservation'
import indexSchema from './schemas/indexSchema'
import { Reservation } from '../entities/Reservation'
import ReservationService from '../services/ReservationService'

export type ReservationServiceInterface = {
  fetchReservationsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<{ data: Reservation[], totalCount: number }>,
  fetchReservation(id: number): Promise<Reservation>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
  const reservationsWithcount = await ReservationService.fetchReservationsWithTotalCount(schemaValues)
  return res.send({ data: reservationsWithcount })
})

export const showReservation = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const reservation = await ReservationService.fetchReservation(id)
  return res.send({ data: reservation })
})

// const insertReservation = asyncHandler(async (req, res, next) => {
//   const {
//     error: reservationSchemaError,
//     value: reservationValues,
//   } = reservationUpsertSchema.validateAsync(req.body, joiOptions)

//   if (reservationSchemaError) {
//     return next({ code: 400, message: 'Invalid input values', error: reservationSchemaError })
//   }

//   // TODO validate if shop, stylist, or user is valid
//   const {
//     error: insertReservationError,
//     value: reservation,
//   } = await ReservationRepository.insertReservation(
//     reservationValues.reservationDate, reservationValues.shopId,
//     reservationValues.stylistId, reservationValues.userId,
//   )

//   if (insertReservationError) {
//     return next({ code: 400, message: 'Invalid input values', error: insertReservationError })
//   }

//   return res.send({ data: reservation })
// })
