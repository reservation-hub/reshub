import { Router } from 'express'

import signUpController from '@/controllers/client/user/UserController'
import authController from '@/controllers/client/auth/AuthController'

const router = Router()

router.use('/signup', signUpController)
router.use('/auth', authController)

export default router
