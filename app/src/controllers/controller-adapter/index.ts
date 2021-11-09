import {
  NextFunction, Request, Response,
} from 'express'
import { CustomRequest } from './Models/Request'
import { ReshubResponse } from './Models/Response'

export type RouteAction = (req: CustomRequest) => Promise<ReshubResponse>

const ControllerAdapter = (f: RouteAction) => async (req: Request, res: Response, next: NextFunction)
  : Promise<any> => {
  const {
    params, body, query, user,
  } = req
  const { locals } = res

  try {
    const response = await f({
      params, body, query, user, locals,
    })
    return res.send(response)
  } catch (e) { return next(e) }
}

export default ControllerAdapter
