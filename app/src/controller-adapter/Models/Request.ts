import { Request, Response } from 'express'
import { LocationQuery } from '../../request-response-types/Location'

export type CustomRequest = {
  params: Record<string, unknown>
  body: Record<string, unknown>
  query: Record<string, unknown>
  locals: {
    id?: number,
    shopId?: number,
    menuItemId?: number,
  }
  user: Express.User | undefined
}

export const CustomRequest = (req: Request, res: Response) : CustomRequest => {
  const {
    params, body, query, user,
  } = req
  const { locals } = res
  return {
    params, body, query, user, locals,
  }
}

export type ReshubRequest = LocationQuery
