import {
  Request, Response, NextFunction, Router,
} from 'express'
import { Area, Prefecture, City } from '../entities/Location'
import { LocationQuery, LocationResponse } from '../request-response-types/Location'
import { roleCheck, parseIntIdMiddleware } from '../routes/utils'
import { AreaController, CityController, PrefectureController } from '../controllers/locationController'

export type AreaControllerInterface = {
  areaIndex(query: LocationQuery) : Promise<LocationResponse>,
  showArea(id: number) : Promise<Area>
}

export type PrefectureControllerInterface = {
  prefectureIndex(query: LocationQuery) : Promise<LocationResponse>,
  showPrefecture(id: number) : Promise<Prefecture>
}

export type CityControllerInterface = {
  cityIndex(query: LocationQuery): Promise<LocationResponse>,
  showCity(id: number) : Promise<City>
}

const areaIndex = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    return res.send(await AreaController.areaIndex({ page, order }))
  } catch (e) { return next(e) }
}

const showArea = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await AreaController.showArea(id))
  } catch (e) { return next(e) }
}

const prefectureIndex = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    return res.send(await PrefectureController.prefectureIndex({ page, order }))
  } catch (e) { return next(e) }
}

const showPrefecture = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await PrefectureController.showPrefecture(id))
  } catch (e) { return next(e) }
}

const cityIndex = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    return res.send(await CityController.cityIndex({ page, order }))
  } catch (e) { return next(e) }
}

const showCity = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await CityController.showCity(id))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/areas', roleCheck(['admin']), areaIndex)
routes.get('/areas/:id', roleCheck(['admin']), parseIntIdMiddleware, showArea)
routes.get('/prefectures', roleCheck(['admin']), prefectureIndex)
routes.get('/prefectures/:id', roleCheck(['admin']), parseIntIdMiddleware, showPrefecture)
routes.get('/cities', roleCheck(['admin']), cityIndex)
routes.get('/cities/:id', roleCheck(['admin']), parseIntIdMiddleware, showCity)

export default routes
