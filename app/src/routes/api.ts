import { Router } from 'express'

import signUpController from '../client/controllers/signUpController'

const router = Router()

router.use('/signup', signUpController)

export default router
