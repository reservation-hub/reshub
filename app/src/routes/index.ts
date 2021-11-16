import {
  Request, Response, NextFunction, Router,
} from 'express'

import { protectAdminRoute, roleCheck } from './utils'

import dashboardController from '../controller-adapter/Dashboard'
import LocationController from '../controller-adapter/Location'
import authController from '../controllers/authController'
import userController from '../controllers/userController'
import shopController from '../controller-adapter/Shop'
import menuController from '../controllers/menuController'
import reservationController from '../controllers/reservationController'

import apiRoutes from './api'
import { InvalidRouteError } from './error'

const router = Router()
export default router

router.use('/auth', authController)
router.use('/', protectAdminRoute, roleCheck(['admin']), LocationController)
router.use('/dashboard', protectAdminRoute, roleCheck(['admin', 'shop_staff']), dashboardController)
router.use('/users', protectAdminRoute, roleCheck(['admin']), userController)
router.use('/shops', protectAdminRoute, roleCheck(['admin', 'shop_staff']), shopController, menuController)
router.use('/reservations', protectAdminRoute, roleCheck(['admin', 'shop_staff']), reservationController)
// client api
router.use('/api/', roleCheck(['client']), apiRoutes)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404s
