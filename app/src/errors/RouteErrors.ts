enum MiddlewareErrorCode {
  InvalidParams = 400,
  Unauthorized = 403,
  ServerError = 500,
}
export class MiddlewareError extends Error {
  constructor(message: string, code: MiddlewareErrorCode) {
    super(message)
    this.name = 'MiddlewareError'
    this.code = code
    Object.setPrototypeOf(this, MiddlewareError.prototype)
  }

  code: MiddlewareErrorCode
}

export class UnknownServerError extends MiddlewareError {
  constructor() {
    super('Unknown Server Error', MiddlewareErrorCode.ServerError)
  }
}
export class InvalidParamsError extends MiddlewareError {
  constructor() {
    super('Invalid parameters', MiddlewareErrorCode.InvalidParams)
  }
}

export class UnauthorizedError extends MiddlewareError {
  constructor() {
    super('User is unauthorized', MiddlewareErrorCode.Unauthorized)
  }
}

export class InvalidRouteError extends Error {
  constructor() {
    super('Route not found')
    this.code = 404
    this.name = 'InvalidRouteError'
    Object.setPrototypeOf(this, InvalidRouteError.prototype)
  }

  code: number
}
