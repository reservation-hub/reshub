import { Router } from 'express'

import signUpController from '../client/controllers/signUpController'
import authController from '../client/controllers/authController'

const router = Router()

router.use('/signup', signUpController)
router.use('/auth', authController)

export default router
