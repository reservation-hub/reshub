import {
  Request, Response, NextFunction, Router,
} from 'express'

import authController from '@controllers/authController'

import dashboardController from '@controller-adapter/Dashboard'
import LocationController from '@controller-adapter/Location'
import shopController from '@controller-adapter/Shop'
import userController from '@controller-adapter/User'
import { protectAdminRoute, roleCheck } from './utils'

import apiRoutes from './api'
import { InvalidRouteError } from './errors'

const router = Router()
export default router

router.use('/auth', authController)
router.use('/dashboard', protectAdminRoute, roleCheck(['admin', 'shop_staff']), dashboardController)
router.use('/shops', protectAdminRoute, roleCheck(['admin', 'shop_staff']), shopController)
router.use('/users', protectAdminRoute, roleCheck(['admin']), userController)
router.use('/', protectAdminRoute, roleCheck(['admin', 'shop_staff']), LocationController)
// client api
router.use('/api/', roleCheck(['client']), apiRoutes)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404s
