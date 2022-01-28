import { Router } from 'express'

import UserController from '@controller-adapter/client/User'
import AuthController from '@controller-adapter/client/Auth'
import ShopController from '@controller-adapter/client/Shop'
import MenuController from '@controller-adapter/client/Menu'
import TagController from '@controller-adapter/client/Tag'
import LocationController from '@controller-adapter/client/Location'

const router = Router()

router.use('/users', UserController)
router.use('/auth', AuthController)
router.use('/shops', ShopController)
router.use('/menus', MenuController)
router.use('/tags', TagController)
router.use('/', LocationController)

export default router
