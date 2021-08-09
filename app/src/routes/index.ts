import {
  Request, Response, NextFunction, Router,
} from 'express'

import { protectRoute, roleCheck, parseIntIdMiddleware } from './utils'
import {
  googleAuthenticate, login, verifyIfNotLoggedInYet, logout, hack,
} from '../controllers/authController'

import * as locationController from '../controllers/locationController'
import * as userController from '../controllers/userController'
import * as roleController from '../controllers/roleController'
import * as shopController from '../controllers/shopController'
import * as stylistController from '../controllers/stylistController'
import * as reservationController from '../controllers/reservationController'
import * as signController from '../client/controllers/signupController'

import pt from './passport'

const router = Router()
export default router

// router.use('/api', protectRoute, apiRoutes)
router.post('/auth/google', verifyIfNotLoggedInYet, googleAuthenticate, login)
router.post('/auth/login', verifyIfNotLoggedInYet, pt.authenticate('local', { session: false }), login)
router.post('/auth/silent_refresh', pt.authenticate('jwt', { session: false }), login)
router.get('/auth/logout', pt.authenticate('jwt', { session: false }), logout)
router.get('/auth/hack', hack, login)

router.get('/areas', protectRoute, roleCheck(['admin']), locationController.areaIndex)
router.get('/prefectures', protectRoute, roleCheck(['admin']), locationController.prefectureIndex)
router.get('/cities', protectRoute, roleCheck(['admin']), locationController.cityIndex)

router.get('/users/', protectRoute, roleCheck(['admin']), userController.index)
router.get('/users/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, userController.showUser)
router.post('/users', protectRoute, roleCheck(['admin']), userController.insertUser)
router.patch('/users/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, userController.updateUser)
router.delete('/users/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, userController.deleteUser)

router.get('/roles', protectRoute, roleCheck(['admin']), roleController.index)
router.get('/roles/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, roleController.showRole)
router.post('/roles', protectRoute, roleCheck(['admin']), roleController.insertRole)
router.patch('/roles/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, roleController.updateRole)
router.delete('/roles/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, roleController.deleteRole)

router.get('/shops', protectRoute, roleCheck(['admin']), shopController.index)
router.get('/shops/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, shopController.showShop)
router.post('/shops/', protectRoute, roleCheck(['admin']), shopController.insertShop)
router.patch('/shops/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, shopController.updateShop)
router.delete('/shops/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, shopController.deleteShop)

// shop schedule
router.post('/shops/:shopId/schedule',
  protectRoute, roleCheck(['admin']), parseIntIdMiddleware, shopController.insertBusinessDaysAndHours)

router.get('/stylists', protectRoute, roleCheck(['admin']), stylistController.index)
router.get('/stylists/:id', protectRoute, roleCheck(['admin']), parseIntIdMiddleware, stylistController.index)
router.post('/stylists', protectRoute, roleCheck(['admin']), stylistController.insertStylist)
router.patch('/stylists/:id',
  protectRoute, roleCheck(['admin']), parseIntIdMiddleware, stylistController.updateStylist)
router.delete('/stylists/:id',
  protectRoute, roleCheck(['admin']), parseIntIdMiddleware, stylistController.deleteStylist)

router.get('/reservations', protectRoute, roleCheck(['admin']), reservationController.index)
router.get('/reservations/:id',
  protectRoute, roleCheck(['admin']), parseIntIdMiddleware, reservationController.showReservation)

// client api
router.post('/api/signup', signController.signup)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next({ code: 404, message: 'Bad route' })) // 404s
