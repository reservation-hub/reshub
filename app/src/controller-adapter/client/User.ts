import {
  Request, Response, NextFunction, Router,
} from 'express'
import { ResponseMessage } from '@request-response-types/Common'
import {
  InsertUserQuery, UpdateUserQuery, UpdateUserPasswordQuery, UserReservationListQuery,
  UserReservationListResponse, UserReservationQuery, ReservationResponse, CancelUserReservationQuery,
  UserResponse, UserReviewListQuery, UserReviewListResponse, UserReviewUpdateQuery, UserReviewDeleteQuery,
  ReviewResponse,
} from '@request-response-types/client/User'
import UserController from '@client/user/UserController'
import ReservationController from '@client/reservation/ReservationController'
import ReviewController from '@client/review/ReviewController'
import { UserForAuth } from '@entities/User'
import { protectClientRoute, parseIntIdMiddleware } from '@routes/utils'
import parseToInt from '@lib/ParseInt'
import { verifyIfNotLoggedInYet } from './Auth'

export type UserControllerInterface = {
  detail(user: UserForAuth | undefined): Promise<UserResponse>
  signUp(query: InsertUserQuery): Promise<UserResponse>
  update(user: UserForAuth | undefined, query: UpdateUserQuery): Promise<UserResponse>
  updatePassword(user: UserForAuth | undefined, query: UpdateUserPasswordQuery): Promise<ResponseMessage>
}

export type ReservationControllerInterface = {
  userReservationsList(user: UserForAuth | undefined, query: UserReservationListQuery)
    : Promise<UserReservationListResponse>
  userReservation(user: UserForAuth | undefined, query: UserReservationQuery): Promise<ReservationResponse>
  cancelUserReservation(user: UserForAuth | undefined, query: CancelUserReservationQuery): Promise<ReservationResponse>
}

export type ReviewControllerInterface = {
  userReviewList(user: UserForAuth | undefined, query: UserReviewListQuery): Promise<UserReviewListResponse>
  update(user: UserForAuth | undefined, query: UserReviewUpdateQuery): Promise<ReviewResponse>
  delete(user: UserForAuth | undefined, query: UserReviewDeleteQuery): Promise<ReviewResponse>
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

const userReviews = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { page, order, take } = req.query
    return res.send(await ReviewController.userReviewList(user,
      { page: parseToInt(page), order, take: parseToInt(take) }))
  } catch (e) { return next(e) }
}

const updateReview = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { reviewId } = res.locals
    const { body: params } = req
    const { shopId } = req.body
    return res.send(await ReviewController.update(user, { reviewId, shopId, params }))
  } catch (e) { return next(e) }
}

const deleteReview = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { reviewId } = res.locals
    const { shopId } = req.body
    return res.send(await ReviewController.delete(user, { reviewId, shopId }))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', protectClientRoute, showUser)
routes.post('/create', verifyIfNotLoggedInYet, signUp)
routes.patch('/', protectClientRoute, update)
routes.patch('/password', protectClientRoute, updateUserPassword)

// reservation routes
routes.get('/reservations', protectClientRoute, userReservations)
routes.get('/reservations/:id', protectClientRoute, parseIntIdMiddleware, userReservation)
routes.delete('/reservations/:id', protectClientRoute, parseIntIdMiddleware, cancelUserReservation)

// review routes
routes.get('/reviews', protectClientRoute, userReviews)
routes.patch('/reviews/:reviewId', protectClientRoute, parseIntIdMiddleware, updateReview)
routes.delete('/reviews/:reviewId', protectClientRoute, parseIntIdMiddleware, deleteReview)

export default routes
