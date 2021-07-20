const router = require('express').Router()
const { viewController } = require('./lib/crudController')

const include = {
  profile: true,
  oAuthIDs: true,
  roles: {
    include: {
      role: true,
    },
  },
}

const manyToMany = model => ({ ...model, roles: model.roles.map(role => role.role) })

router.get('/', viewController.index('user', include, manyToMany))
router.get('/:id', viewController.show('user', include, manyToMany))
// TODO: add CUD endpoints

module.exports = router
