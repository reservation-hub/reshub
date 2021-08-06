import {
  Request, Response, NextFunction, Router,
} from 'express'

import { protectRoute, roleCheck, parseIntIDMiddleware } from './utils'
import {
  googleAuthenticate, login, verifyIfNotLoggedInYet, logout, hack,
} from '../controllers/authController'

import * as locationController from '../controllers/locationController'
import * as userController from '../controllers/userController'
import * as roleController from '../controllers/roleController'
import * as shopController from '../controllers/shopController'
import * as stylistController from '../controllers/stylistController'
import * as reservationController from '../controllers/reservationController'

import pt from './passport'

// const apiRoutes:Router[] = []
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
router.get('/users/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, userController.showUser)
router.post('/users', protectRoute, roleCheck(['admin']), userController.insertUser)
router.patch('/users/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, userController.updateUser)
router.delete('/users/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, userController.deleteUser)

router.get('/roles', protectRoute, roleCheck(['admin']), roleController.index)
router.get('/roles/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, roleController.showRole)
router.post('/roles', protectRoute, roleCheck(['admin']), roleController.insertRole)
router.patch('/roles/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, roleController.updateRole)
router.delete('/roles/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, roleController.deleteRole)

router.get('/shops', protectRoute, roleCheck(['admin']), shopController.index)
router.get('/shops/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, shopController.showShop)
router.post('/shops/', protectRoute, roleCheck(['admin']), shopController.insertShop)
router.patch('/shops/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, shopController.updateShop)
router.delete('/shops/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, shopController.deleteShop)

router.get('/stylists', protectRoute, roleCheck(['admin']), stylistController.index)
router.get('/stylists/:id', protectRoute, roleCheck(['admin']), parseIntIDMiddleware, stylistController.index)
router.post('/stylists', protectRoute, roleCheck(['admin']), stylistController.insertStylist)
router.patch('/stylists/:id',
  protectRoute, roleCheck(['admin']), parseIntIDMiddleware, stylistController.updateStylist)
router.delete('/stylists/:id',
  protectRoute, roleCheck(['admin']), parseIntIDMiddleware, stylistController.deleteStylist)

router.get('/reservations', protectRoute, roleCheck(['admin']), reservationController.index)
router.get('/reservations/:id',
  protectRoute, roleCheck(['admin']), parseIntIDMiddleware, reservationController.showReservation)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next({ code: 404, message: 'Bad route' })) // 404s
