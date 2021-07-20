const router = require('express').Router()
const { viewController } = require('./lib/crudController')

const include = {
  profile: true,
  oAuthIDs: true,
}

router.get('/', viewController.index('user', include))
router.get('/:id', viewController.show('user', include))
// TODO: add CUD endpoints

module.exports = router
