export enum ErrorCode {
  NotFound,
  InvalidParams,
}

export class ServiceError extends Error {
  constructor(message: string, code: ErrorCode) {
    super(message)
    Object.setPrototypeOf(this, ServiceError.prototype)
    this.name = 'ServiceError'
    this.code = code
  }

  code: ErrorCode
}

export class NotFoundError extends ServiceError {
  constructor() {
    super('Resource not found', ErrorCode.NotFound)
  }
}

export class InvalidParamsError extends ServiceError {
  constructor() {
    super('Invalid query params', ErrorCode.InvalidParams)
  }
}
