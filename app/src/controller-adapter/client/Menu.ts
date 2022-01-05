import {
  Request, Response, NextFunction, Router,
} from 'express'
import { UserForAuth } from '@entities/User'
import { PopularMenusResponse } from '@request-response-types/client/Menu'
import MenuController from '@client/menu/MenuController'

export type MenuControllerInterface = {
  popularMenus(user: UserForAuth | undefined): Promise<PopularMenusResponse>
}

const popular = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    return res.send(await MenuController.popularMenus(user))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/popular', popular)

export default routes
