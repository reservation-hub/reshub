import {
  Request, Response, NextFunction, Router,
} from 'express'
import { RoleSlug } from '@entities/Role'
import authController from '@controller-adapter/Auth'

import dashboardController from '@controller-adapter/Dashboard'
import LocationController from '@controller-adapter/Location'
import shopController from '@controller-adapter/Shop'
import userController from '@controller-adapter/User'
import { protectAdminRoute, roleCheck } from './utils'

import apiRoutes from './api'
import { InvalidRouteError } from './errors'

const router = Router()
export default router

// client api
router.use('/api/', apiRoutes)
router.use('/api/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404

router.use('/auth', authController)
router.use('/dashboard', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), dashboardController)
router.use('/shops', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), shopController)
router.use('/users', protectAdminRoute, roleCheck([RoleSlug.ADMIN]), userController)
router.use('/', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), LocationController)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404
