const router = require('express').Router()
const { viewController } = require('./lib/viewController')

router.get('/', viewController.index('role'))
router.get('/:id', viewController.show('role'))
// TODO: add CUD endpoints

module.exports = router
