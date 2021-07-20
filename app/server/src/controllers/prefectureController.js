const router = require('express').Router()
const { viewController } = require('./lib/crudController')

router.get('/', viewController.index('prefecture'))

module.exports = router
