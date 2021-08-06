import { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import {
  DuplicateModel, InvalidParams, InvalidToken, NotFound, ServiceError,
} from './services/Errors/ServiceError'

export type ResHubError = {
  error: Prisma.PrismaClientKnownRequestError | any,
  message: string,
  code: number,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err: ResHubError, req, res, next) => {
  console.error('error: ', err)
  const { error, message } = err

  if (error !== undefined) {
    if (error instanceof ServiceError) {
      let code: number
      switch (error.code) {
        case InvalidParams:
        case DuplicateModel:
          code = 400
          break
        case InvalidToken:
          code = 401
          break
        case NotFound:
          code = 404
          break
        default:
          code = 500
      }
      return res.status(code).send({ error: { message: error.message } })
    }
    // prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).send({
          error: { message: error.message },
        })
      }

      if (error.code === 'P2025') {
        // code 404 エラー
        return res.status(404).send({ error: { message: error.message } })
      }

      if (error.code[0] === 'P') {
        return res.status(500).send({ error: { message: 'Server Error' } })
      }
      return res.status(400).send({ error: { message } })
    }

    if (error.name === 'ValidationError') {
      // Joi Validation エラー処理
      const messages = error.details.map((e: any) => ({
        label: e.context.label,
        message: e.message,
      }))
      return res.status(400).send({ error: { message: messages } })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).send({ error: { message } })
    }
  }

  return res.status(500).send({ error: { message: 'Internal Server Error' } })
}
