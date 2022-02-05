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
  constructor(message: string) {
    super(`Resource not found: ${message}`, ErrorCode.NotFound)
  }
}

export class InvalidTokenError extends ServiceError {
  constructor(message: string) {
    super(`Invalid token: ${message}`, ErrorCode.InvalidToken)
  }
}

export class InvalidParamsError extends ServiceError {
  constructor(message: string) {
    super(`Invalid query params: ${message}`, ErrorCode.InvalidParams)
  }
}

export class DuplicateModelError extends ServiceError {
  constructor(message: string) {
    super(`Duplicate resource found: ${message}`, ErrorCode.DuplicateModel)
  }
}

export class UserIsLoggedInError extends ServiceError {
  constructor(message: string) {
    super(`User is logged in: ${message}`, ErrorCode.LoggedIn)
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string) {
    super(`User authentication failed: ${message}`, ErrorCode.Authentication)
  }
}

export class AuthorizationError extends ServiceError {
  constructor(message: string) {
    super(`User not Authorized: ${message}`, ErrorCode.Authorization)
  }
}

export class UnavailableError extends ServiceError {
  constructor(message: string) {
    super(`Reservation is already taken: ${message}`, ErrorCode.Unavailable)
  }
}
