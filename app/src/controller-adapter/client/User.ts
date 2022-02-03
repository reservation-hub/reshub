import {
  Request, Response, NextFunction, Router,
} from 'express'
import { ResponseMessage } from '@request-response-types/Common'
import {
  InsertUserQuery, UpdateUserQuery, UpdateUserPasswordQuery, UserReservationListQuery,
  UserReservationListResponse, UserReservationQuery, ReservationResponse, CancelUserReservationQuery, UserResponse,
} from '@request-response-types/client/User'
import UserController from '@client/user/UserController'
import ReservationController from '@client/reservation/ReservationController'
import { UserForAuth } from '@entities/User'
import { protectClientRoute } from '@routes/utils'
import parseToInt from '@lib/ParseInt'
import { verifyIfNotLoggedInYet } from './Auth'

export type UserControllerInterface = {
  detail(user: UserForAuth | undefined): Promise<UserResponse>
  signUp(query: InsertUserQuery): Promise<ResponseMessage>
  update(user: UserForAuth | undefined, query: UpdateUserQuery): Promise<ResponseMessage>
  updatePassword(user: UserForAuth | undefined, query: UpdateUserPasswordQuery): Promise<ResponseMessage>
}

export type ReservationControllerInterface = {
  userReservationsList(user: UserForAuth | undefined, query: UserReservationListQuery)
    : Promise<UserReservationListResponse>
  userReservation(user: UserForAuth | undefined, query: UserReservationQuery): Promise<ReservationResponse>
  cancelUserReservation(user: UserForAuth | undefined, query: CancelUserReservationQuery): Promise<ResponseMessage>
}

const showUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    return res.send(await UserController.detail(user))
  } catch (e) { return next(e) }
}

const signUp = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await UserController.signUp(body))
  } catch (e) { return next(e) }
}

const update = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user, body } = req
    return res.send(await UserController.update(user, body))
  } catch (e) { return next(e) }
}

const updateUserPassword = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body, user } = req
    return res.send(await UserController.updatePassword(user, body))
  } catch (e) { return next(e) }
}

const userReservations = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order, take } = req.query
    const { user } = req
    return res.send(await ReservationController.userReservationsList(user,
      { page: parseToInt(page), order, take: parseToInt(take) }))
  } catch (e) { return next(e) }
}

const userReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { id } = res.locals
    return res.send(await ReservationController.userReservation(user, { id }))
  } catch (e) { return next(e) }
}

const cancelUserReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { id } = res.locals
    return res.send(await ReservationController.cancelUserReservation(user, { id }))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', protectClientRoute, showUser)
routes.post('/create', verifyIfNotLoggedInYet, signUp)
routes.patch('/', protectClientRoute, update)
routes.patch('/password', protectClientRoute, updateUserPassword)

// reservation routes
routes.get('/reservations', protectClientRoute, userReservations)
routes.get('/reservations/:id', protectClientRoute, userReservation)
routes.delete('/reservations/:id', protectClientRoute, cancelUserReservation)

export default routes
