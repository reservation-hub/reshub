const router = require('express').Router()
const { viewController } = require('./lib/viewController')

router.get('/', viewController.index('prefecture'))

module.exports = router
