import { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ValidationError, ValidationErrorItem } from 'joi'
import { ZodError } from 'zod'

import EntityErrorCode from '@errors/ErrorCodes'
import { ServiceError } from '@errors/ServiceErrors'
import Logger from '@lib/Logger'
import { MiddlewareError, InvalidRouteError } from '@errors/RouteErrors'

enum ErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export type ResHubError =
  PrismaClientKnownRequestError | ValidationError | InvalidRouteError | ServiceError

export const errorHandler: ErrorRequestHandler = (error: ResHubError | MiddlewareError,
  req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  if (error.name === 'ServiceError') {
    Logger.debug('Service error')
    error as ServiceError
    let code: ErrorCode
    switch (error.code) {
      case EntityErrorCode.InvalidParams:
      case EntityErrorCode.DuplicateModel:
        code = ErrorCode.BadRequest
        break
      case EntityErrorCode.Authorization:
      case EntityErrorCode.Authentication:
      case EntityErrorCode.InvalidToken:
        code = ErrorCode.Unauthorized
        break
      case EntityErrorCode.LoggedIn:
        code = ErrorCode.Forbidden
        break
      case EntityErrorCode.NotFound:
      case EntityErrorCode.Unavailable:
      case EntityErrorCode.OutOfSchedule:
        code = ErrorCode.NotFound
        break
      default:
        code = ErrorCode.InternalServerError
    }
    return res.status(code).send(error.message)
  }
  // prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    Logger.error('Prisma error')
    Logger.error(error.message)
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

  if (error instanceof ZodError) {
    Logger.debug('zod error')
    const keys = error.issues.map(e => e.path.toString())
    return res.status(ErrorCode.BadRequest).send({ keys, message: 'Invalid values error' })
  }

  if (error instanceof ValidationError) {
    // Joi Validation エラー処理
    Logger.debug(error)
    const keys = error.details.map((e: ValidationErrorItem) => e.path.toString())
    return res.status(ErrorCode.BadRequest).send({ keys, message: 'Invalid values error' })
  }

  if (error instanceof JsonWebTokenError) {
    return res.status(ErrorCode.BadRequest).send(error.message)
  }

  if (error.name === 'InvalidRouteError' || error.name === 'MiddlewareError') {
    return res.status(ErrorCode.NotFound).send(error.message)
  }

  Logger.error('Server Error')
  Logger.error(error.message)
  return res.status(ErrorCode.InternalServerError).send('Internal Server Error')
}
