const router = require('express').Router()
const { viewController } = require('./lib/crudController')

router.get('/', viewController.index('area'))

module.exports = router
