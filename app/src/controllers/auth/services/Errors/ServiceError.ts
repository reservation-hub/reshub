type ServiceErrorCode = number
export const NotFound: ServiceErrorCode = 0
export const InvalidToken: ServiceErrorCode = 1
export const InvalidParams: ServiceErrorCode = 2
export const DuplicateModel: ServiceErrorCode = 3
export const LoggedIn: ServiceErrorCode = 4
export const Authentication: ServiceErrorCode = 5
export const Authorization: ServiceErrorCode = 6
export class ServiceError extends Error {
  constructor(message: string, code: ServiceErrorCode) {
    super(message)
    Object.setPrototypeOf(this, ServiceError.prototype)
    this.name = 'ServiceError'
    this.code = code
  }

    code: ServiceErrorCode
}

export class NotFoundError extends ServiceError {
  constructor() {
    super('Resource not found', NotFound)
  }
}

export class InvalidTokenError extends ServiceError {
  constructor() {
    super('Invalid token', InvalidToken)
  }
}

export class InvalidParamsError extends ServiceError {
  constructor() {
    super('Invalid query params', InvalidParams)
  }
}

export class UserIsLoggedInError extends ServiceError {
  constructor() {
    super('User is logged in', LoggedIn)
  }
}

export class AuthenticationError extends ServiceError {
  constructor() {
    super('User authentication failed', Authentication)
  }
}

export class AuthorizationError extends ServiceError {
  constructor() {
    super('User not Authorized', Authorization)
  }
}
