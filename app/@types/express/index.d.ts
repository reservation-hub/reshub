import { OrderBy } from '@entities/Common'
import 'express'

declare module 'express' {

  interface Request {
    query: {
      page: number,
      limit: number,
      order: OrderBy,
    } | any
  }

}
