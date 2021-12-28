import { Router } from 'express'

import signUpController from '@controller-adapter/client/User'
import AuthController from '@controller-adapter/client/Auth'
import ShopController from '@/controller-adapter/client/Shop'

const router = Router()

router.use('/user', signUpController)
router.use('/auth', AuthController)
router.use('/shops', ShopController)

export default router
