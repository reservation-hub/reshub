const router = require('express').Router()
const { viewController } = require('./lib/crudController')

router.get('/', viewController.index('city'))

module.exports = router
