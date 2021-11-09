import { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ValidationError, ValidationErrorItem } from 'joi'
import {
  DuplicateModel, InvalidParams, InvalidToken, LoggedIn, NotFound, ServiceError,
} from './services/Errors/ServiceError'
import { InvalidRouteError } from './routes/error'
import { MiddlewareError } from './routes/errors'

export type ResHubError =
  PrismaClientKnownRequestError | ServiceError | JsonWebTokenError | ValidationError | InvalidRouteError

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error: ResHubError | MiddlewareError, req, res, next) => {
  console.error('error: ', error)
  if (error instanceof ServiceError) {
    console.error('is service error')

    let code: number
    switch (error.code) {
      case InvalidParams:
      case DuplicateModel:
        code = 400
        break
      case InvalidToken:
        code = 401
        break
      case LoggedIn:
        code = 403
        break
      case NotFound:
        code = 404
        break
      default:
        code = 500
    }
    res.status(code).send({ error: { message: error.message } })
  }
  // prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(400).send({
        error: { message: error.message },
      })
    }

    if (error.code === 'P2025') {
      // code 404 エラー
      res.status(404).send({ error: { message: error.message } })
    }

    if (error.code[0] === 'P') {
      res.status(500).send({ error: { message: 'Server Error' } })
    }
    res.status(400).send({ error: { message: error.message } })
  }

  if (error instanceof ValidationError) {
    // Joi Validation エラー処理
    console.error(error)
    error.details.forEach(item => {
      // eslint-disable-next-line no-console
      console.log(item.path)
    })
    const keys = error.details.map((e: ValidationErrorItem) => e.path.toString())
    res.status(400).send({ error: { keys, message: 'Invalid values error' } })
  }

  if (error instanceof JsonWebTokenError) {
    res.status(400).send({ error: { message: error.message } })
  }

  if (error instanceof InvalidRouteError || error instanceof MiddlewareError) {
    res.status(error.code).send({ error: { message: error.message } })
  }

  res.status(500).send({ error: { message: 'Internal Server Error' } })
}
