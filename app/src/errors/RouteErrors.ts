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
  constructor(message?: string) {
    super(message ?? 'Unknown Server Error', MiddlewareErrorCode.ServerError)
  }
}
export class InvalidParamsError extends MiddlewareError {
  constructor(message?: string) {
    super(message ?? 'Invalid parameters', MiddlewareErrorCode.InvalidParams)
  }
}

export class UnauthorizedError extends MiddlewareError {
  constructor(message?: string) {
    super(message ?? 'User is unauthorized', MiddlewareErrorCode.Unauthorized)
  }
}

export class InvalidRouteError extends Error {
  constructor(message?: string) {
    super(message ?? 'Route not found')
    this.code = 404
    this.name = 'InvalidRouteError'
    Object.setPrototypeOf(this, InvalidRouteError.prototype)
  }

  code: number
}
