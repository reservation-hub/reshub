import { Router } from 'express'

import signUpController from '@controller-adapter/client/User'
import AuthController from '@controller-adapter/client/Auth'

const router = Router()

router.use('/user', signUpController)
router.use('/auth', AuthController)

export default router
