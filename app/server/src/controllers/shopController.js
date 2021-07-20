const router = require('express').Router()
const { viewController } = require('./lib/crudController')

const include = {}

router.get('/', viewController.index('shop', include))
router.get('/:id', viewController.show('shop'))
// TODO: add CUD endpoints

module.exports = router
