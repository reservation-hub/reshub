const router = require('express').Router()
const { viewController } = require('./lib/viewController')

router.get('/', viewController.index('area'))

module.exports = router
