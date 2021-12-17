import {
  Request, Response, NextFunction, Router,
} from 'express'
import { RoleSlug } from '@entities/Role'
import LocationController from '@controllers/locationController'
import { roleCheck, parseIntIdMiddleware } from '@routes/utils'
import { AreaPrefecturesResponse, AreaResponse, PrefectureCitiesResponse } from '@request-response-types/Location'

export type LocationControllerInterface = {
  areaList() : Promise<AreaResponse>,
  areaPrefectures(areaId: number) : Promise<AreaPrefecturesResponse>
  prefectureCities(prefectureId: number) : Promise<PrefectureCitiesResponse>
}

const areaList = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    return res.send(await LocationController.areaList())
  } catch (e) { return next(e) }
}

const areaPrefectures = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await LocationController.areaPrefectures(id))
  } catch (e) { return next(e) }
}

const prefectureCities = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await LocationController.prefectureCities(id))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/areas', roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), areaList)
routes.get('/areas/:id/prefectures', roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]),
  parseIntIdMiddleware, areaPrefectures)
routes.get('/prefectures/:id/cities', roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]),
  parseIntIdMiddleware, prefectureCities)

export default routes
