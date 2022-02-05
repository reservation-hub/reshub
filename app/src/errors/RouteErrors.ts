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
  constructor(message: string) {
    super(`Unknown Server Error: ${message}`, MiddlewareErrorCode.ServerError)
  }
}
export class InvalidParamsError extends MiddlewareError {
  constructor(message: string) {
    super(`Invalid parameters: ${message}`, MiddlewareErrorCode.InvalidParams)
  }
}

export class UnauthorizedError extends MiddlewareError {
  constructor(message: string) {
    super(`User is unauthorized: ${message}`, MiddlewareErrorCode.Unauthorized)
  }
}

export class InvalidRouteError extends Error {
  constructor(message: string) {
    super(`Route not found: ${message}`)
    this.code = 404
    this.name = 'InvalidRouteError'
    Object.setPrototypeOf(this, InvalidRouteError.prototype)
  }

  code: number
}
