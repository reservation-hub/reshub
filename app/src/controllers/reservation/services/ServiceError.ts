import { ErrorCode } from '@entities/Common'

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
export class AuthorizationError extends ServiceError {
  constructor() {
    super('User not Authorized', ErrorCode.Authorization)
  }
}
export class UnavailableError extends ServiceError {
  constructor() {
    super('Reservation is already taken', ErrorCode.Unavailable)
  }
}

export class OutOfScheduleError extends ServiceError {
  constructor() {
    super('Reservation is not within Shop Schedule', ErrorCode.OutOfSchedule)
  }
}
