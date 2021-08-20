import {
  Request, Response, NextFunction, Router,
} from 'express'

import { protectRoute } from './utils'

import dashboardController from '../controllers/dashboardController'
import { areaController, prefectureController, cityController } from '../controllers/locationController'
import authController from '../controllers/authController'
import userController from '../controllers/userController'
import shopController from '../controllers/shopController'
import menuController from '../controllers/menuController'
import roleController from '../controllers/roleController'
import reservationController from '../controllers/reservationController'

import apiRoutes from './api'
import { InvalidRouteError } from './error'

const router = Router()
export default router

router.use('/auth', authController)
router.use('/dashboard', protectRoute, dashboardController)
router.use('/areas', protectRoute, areaController)
router.use('/prefectures', protectRoute, prefectureController)
router.use('/cities', protectRoute, cityController)
router.use('/users', protectRoute, userController)
router.use('/roles', protectRoute, roleController)
router.use('/shops', protectRoute, shopController, menuController)
router.use('/reservations', protectRoute, reservationController)

// client api
router.use('/api/', apiRoutes)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404s
