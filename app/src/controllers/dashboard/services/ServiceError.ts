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
