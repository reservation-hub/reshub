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
  constructor(message?: string) {
    super(message ?? 'Resource not found', ErrorCode.NotFound)
  }
}

export class InvalidTokenError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'Invalid token', ErrorCode.InvalidToken)
  }
}

export class InvalidParamsError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'Invalid query params', ErrorCode.InvalidParams)
  }
}

export class DuplicateModelError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'Duplicate resource found', ErrorCode.DuplicateModel)
  }
}

export class UserIsLoggedInError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'User is logged in', ErrorCode.LoggedIn)
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'User authentication failed', ErrorCode.Authentication)
  }
}

export class AuthorizationError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'User not Authorized', ErrorCode.Authorization)
  }
}

export class UnavailableError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'Reservation is already taken', ErrorCode.Unavailable)
  }
}

export class OutOfScheduleError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'Reservation is not within Shop Schedule', ErrorCode.OutOfSchedule)
  }
}

export class NoSeatsAvailableError extends ServiceError {
  constructor(message?: string) {
    super(message ?? 'There are no seats available at the moment try diffrent date or time',
      ErrorCode.NoSeatsUnavailable)
  }
}
