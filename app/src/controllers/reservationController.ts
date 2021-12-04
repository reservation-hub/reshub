import {
  Router, Request, Response, NextFunction,
} from 'express'
import { Reservation } from '@entities/Reservation'
import { User } from '@entities/User'
import { parseIntIdMiddleware, roleCheck } from '@routes/utils'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { reservationUpsertSchema } from './schemas/reservation'
import indexSchema from './schemas/indexSchema'
import ReservationService from '../services/ReservationService'
import { insertReservationQuery, updateReservationQuery } from '../request-response-types/ReservationService'
import { searchSchema } from './schemas/search'

export type ReservationServiceInterface = {
  fetchReservationsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<{ data: Reservation[], totalCount: number }>,
  fetchReservation(id: number): Promise<Reservation>,
  insertReservation(query: insertReservationQuery): Promise<Reservation>,
  updateReservation(query: updateReservationQuery): Promise<Reservation>,
  deleteReservation(id: number): Promise<Reservation>,
  searchReservations(keyword: string): Promise<User[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await indexSchema.validateAsync(req.query, joiOptions)
    const reservationsWithcount = await ReservationService.fetchReservationsWithTotalCount(params)
    return res.send(reservationsWithcount)
  } catch (e) { return next(e) }
}

export const showReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    const reservation = await ReservationService.fetchReservation(id)
    return res.send(reservation)
  } catch (e) { return next(e) }
}

const insertReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await reservationUpsertSchema.validateAsync(req.body, joiOptions)
    const reservation = await ReservationService.insertReservation(params)
    return res.send(reservation)
  } catch (e) { return next(e) }
}

export const searchReservations = async (req: Request, res: Response, next: NextFunction)
  : Promise<Response | void> => {
  try {
    const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
    const reservation = await ReservationService.searchReservations(searchValues.keyword)

    return res.send({ data: reservation })
  } catch (e) { return next(e) }
}

const updateReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await reservationUpsertSchema.validateAsync(req.body, joiOptions)
    const { id } = res.locals
    const reservation = await ReservationService.updateReservation({ id, params })
    return res.send(reservation)
  } catch (e) { return next(e) }
}

const deleteReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    await ReservationService.deleteReservation(id)
    return res.send({ message: 'Reservation deleted' })
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showReservation)
routes.post('/', roleCheck(['admin']), insertReservation)
routes.post('/search', searchReservations)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateReservation)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteReservation)

export default routes
