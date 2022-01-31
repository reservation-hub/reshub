import {
  Request, Response, NextFunction, Router,
} from 'express'
import { RoleSlug } from '@entities/Role'
import authController from '@controller-adapter/Auth'

import dashboardController from '@controller-adapter/Dashboard'
import LocationController from '@controller-adapter/Location'
import shopController from '@controller-adapter/Shop'
import userController from '@controller-adapter/User'
import TagController from '@controller-adapter/Tag'
import { InvalidRouteError } from '@errors/RouteErrors'
import { protectAdminRoute, roleCheck } from '@routes/utils'

import apiRoutes from './api'

const router = Router()
export default router

// client api
router.use('/client/', apiRoutes)
router.use('/client/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404

router.use('/auth', authController)
router.use('/dashboard', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), dashboardController)
router.use('/shops', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), shopController)
router.use('/users', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), userController)
router.use('/tags', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), TagController)
router.use('/', protectAdminRoute, roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), LocationController)
router.use('/', (req: Request, res: Response) => res.send('Reshub'))

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404
