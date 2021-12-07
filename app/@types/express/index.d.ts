import 'express'

declare module 'express' {

  interface Request {
    query: {
      page: number,
      limit: number,
      order: any,
    } | any
  }
}
