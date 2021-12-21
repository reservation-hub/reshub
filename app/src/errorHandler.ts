import { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ValidationError, ValidationErrorItem } from 'joi'

import { ServiceError as ShopServiceError } from '@shop/services/ServiceError'
import { ServiceError as UserServiceError } from '@user/services/ServiceError'
import { ServiceError as DashboardServiceError } from '@dashboard/services/ServiceError'
import { ServiceError as AuthServiceError } from '@location/services/ServiceError'
import { ServiceError as LocationServiceError } from '@auth/services/ServiceError'

import { ErrorCode as EntityErrorCode } from '@entities/Common'
import { MiddlewareError, InvalidRouteError } from './routes/errors'

enum ErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

type ServiceError = ShopServiceError | UserServiceError | DashboardServiceError |
  AuthServiceError | LocationServiceError

export type ResHubError =
  PrismaClientKnownRequestError | ValidationError | InvalidRouteError | ServiceError

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error: ResHubError | MiddlewareError,
  req, res, next) => {
  console.error('error: ', error)
  if (error.name === 'ServiceError') {
    console.error('is service error')
    error as ServiceError
    let code: ErrorCode
    switch (error.code) {
      case EntityErrorCode.InvalidParams:
      case EntityErrorCode.DuplicateModel:
        code = ErrorCode.BadRequest
        break
      case EntityErrorCode.InvalidToken:
        code = ErrorCode.Unauthorized
        break
      case EntityErrorCode.LoggedIn:
        code = ErrorCode.Forbidden
        break
      case EntityErrorCode.NotFound:
        code = ErrorCode.NotFound
        break
      default:
        code = ErrorCode.InternalServerError
    }
    return res.status(code).send(error.message)
  }
  // prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(ErrorCode.BadRequest).send(error.message)
    }

    if (error.code === 'P2025') {
      // code 404 エラー
      return res.status(ErrorCode.NotFound).send(error.message)
    }

    if (error.code[0] === 'P') {
      return res.status(ErrorCode.InternalServerError).send('Server Error')
    }
    return res.status(ErrorCode.BadRequest).send(error.message)
  }

  if (error instanceof ValidationError) {
    // Joi Validation エラー処理
    console.error(error)
    const keys = error.details.map((e: ValidationErrorItem) => e.path.toString())
    return res.status(ErrorCode.BadRequest).send({ keys, message: 'Invalid values error' })
  }

  if (error instanceof JsonWebTokenError) {
    return res.status(ErrorCode.BadRequest).send(error.message)
  }

  if (error.name === 'InvalidRouteError' || error.name === 'MiddlewareError') {
    return res.status(ErrorCode.NotFound).send(error.message)
  }

  return res.status(ErrorCode.InternalServerError).send('Internal Server Error')
}
