const router = require('express').Router()
const { viewController } = require('./lib/viewController')

const include = {
  area: true,
  prefecture: true,
  city: true,
}
const manyToMany = model => ({ ...model, roles: model.roles.map(role => role.role) })

// const joiOptions = { abortEarly: false, stripUnknown: true }

router.get('/', viewController.index('user', include, manyToMany))
router.get('/:id', viewController.show('user', include, manyToMany))

module.exports = router
