import {
  Request, Response, NextFunction, Router,
} from 'express'

import { protectRoute } from './utils'

import { areaController, prefectureController, cityController } from '../controllers/locationController'
import authController from '../controllers/authController'
import userController from '../controllers/userController'
import shopController from '../controllers/shopController'
import roleController from '../controllers/roleController'
import stylistController from '../controllers/stylistController'
import reservationController from '../controllers/reservationController'
import apiRoutes from './api'

const router = Router()
export default router

router.use('/auth', authController)
router.use('/areas', protectRoute, areaController)
router.use('/prefectures', protectRoute, prefectureController)
router.use('/cities', protectRoute, cityController)
router.use('/users', protectRoute, userController)
router.use('/roles', protectRoute, roleController)
router.use('/shops', protectRoute, shopController)
router.use('/stylists', protectRoute, stylistController)
router.use('/reservations', protectRoute, reservationController)

// client api
router.use('/api/', apiRoutes)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next({ code: 404, message: 'Bad route' })) // 404s
