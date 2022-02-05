import ErrorCode from '@errors/ErrorCodes'

export class ControllerError extends Error {
  constructor(message: string, code: ErrorCode) {
    super(message)
    this.name = 'MiddlewareError'
    this.code = code
    Object.setPrototypeOf(this, ControllerError.prototype)
  }

  code: ErrorCode
}

export class UnauthorizedError extends ControllerError {
  constructor(message: string) {
    super(`Unauthorized Error: ${message}`, ErrorCode.Authorization)
  }
}
