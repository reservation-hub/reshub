type MiddlewareErrorCode = number
export const InvalidParams: MiddlewareErrorCode = 400
export const Unauthorized: MiddlewareErrorCode = 403

export class MiddlewareError extends Error {
  constructor(message: string, code: MiddlewareErrorCode) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, MiddlewareError.prototype)
  }

  code: MiddlewareErrorCode
}

export class InvalidParamsError extends MiddlewareError {
  constructor() {
    super('Invalid parameters', InvalidParams)
  }
}

export class UnauthorizedError extends MiddlewareError {
  constructor() {
    super('User is unauthorized', Unauthorized)
  }
}
