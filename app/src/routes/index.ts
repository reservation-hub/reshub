import {
  Request, Response, NextFunction, Router,
} from 'express'

import { protectAdminRoute, roleCheck } from './utils'

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
router.use('/dashboard', protectAdminRoute, roleCheck(['admin', 'shop_staff']), dashboardController)
router.use('/areas', protectAdminRoute, roleCheck(['admin']), areaController)
router.use('/prefectures', protectAdminRoute, roleCheck(['admin']), prefectureController)
router.use('/cities', protectAdminRoute, roleCheck(['admin']), cityController)
router.use('/users', protectAdminRoute, roleCheck(['admin']), userController)
router.use('/roles', protectAdminRoute, roleCheck(['admin']), roleController)
router.use('/shops', protectAdminRoute, roleCheck(['admin', 'shop_staff']), shopController, menuController)
router.use('/reservations', protectAdminRoute, roleCheck(['admin', 'shop_staff']), reservationController)
// client api
router.use('/api/', roleCheck(['client']), apiRoutes)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404s
