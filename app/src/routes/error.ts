export class InvalidRouteError extends Error {
  constructor() {
    super('Route not found')
    this.code = 404
    Object.setPrototypeOf(this, InvalidRouteError.prototype)
  }

  code: number
}
