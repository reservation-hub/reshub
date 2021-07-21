const router = require('express').Router()
// const Joi = require('joi')
// const eah = require('express-async-handler')
// const { userSchema } = require('../schemas/user')
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

// const insertUser = eah(async (req, res, next) => {
//   Joi.assert(req.body, userSchema)
//   const {

//   }
// })

router.get('/', viewController.index('user', include, manyToMany))
router.get('/:id', viewController.show('user', include, manyToMany))
// TODO: add CUD endpoints

module.exports = router
