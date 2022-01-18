import ErrorCode from '@errors/ErrorCodes'

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

export class InvalidTokenError extends ServiceError {
  constructor() {
    super('Invalid token', ErrorCode.InvalidToken)
  }
}

export class InvalidParamsError extends ServiceError {
  constructor() {
    super('Invalid query params', ErrorCode.InvalidParams)
  }
}

export class DuplicateModelError extends ServiceError {
  constructor() {
    super('Duplicate resource found', ErrorCode.DuplicateModel)
  }
}

export class UserIsLoggedInError extends ServiceError {
  constructor() {
    super('User is logged in', ErrorCode.LoggedIn)
  }
}

export class AuthenticationError extends ServiceError {
  constructor() {
    super('User authentication failed', ErrorCode.Authentication)
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

export class NoSeatsAvailableError extends ServiceError {
  constructor() {
    super('There are no seats available at the moment try diffrent date or time', ErrorCode.NoSeatsUnavailable)
  }
}
