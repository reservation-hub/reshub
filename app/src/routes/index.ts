import {
  Request, Response, NextFunction, Router,
} from 'express'

import authController from '@controllers/authController'
import userController from '@controllers/userController'
import menuController from '@controllers/menuController'
import reservationController from '@controllers/reservationController'
import { protectAdminRoute, roleCheck } from './utils'

import dashboardController from '../controller-adapter/Dashboard'
import LocationController from '../controller-adapter/Location'
import shopController from '../controller-adapter/Shop'

import apiRoutes from './api'
import { InvalidRouteError } from './error'

const router = Router()
export default router

router.use('/auth', authController)
router.use('/dashboard', protectAdminRoute, roleCheck(['admin', 'shop_staff']), dashboardController)
router.use('/shops', protectAdminRoute, roleCheck(['admin', 'shop_staff']), shopController, menuController)
router.use('/reservations', protectAdminRoute, roleCheck(['admin', 'shop_staff']), reservationController)
router.use('/users', protectAdminRoute, roleCheck(['admin']), userController)
router.use('/', protectAdminRoute, roleCheck(['admin']), LocationController)
// client api
router.use('/api/', roleCheck(['client']), apiRoutes)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404s
