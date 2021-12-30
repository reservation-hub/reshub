import { Router } from 'express'

import UserController from '@controller-adapter/client/User'
import AuthController from '@controller-adapter/client/Auth'
import ShopController from '@controller-adapter/client/Shop'
import MenuController from '@controller-adapter/client/Menu'

const router = Router()

router.use('/user', UserController)
router.use('/auth', AuthController)
router.use('/shops', ShopController)
router.use('/menu', MenuController)

export default router
