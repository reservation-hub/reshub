const router = require('express').Router()
const Joi = require('joi')
const eah = require('express-async-handler')
const { parseIDToInt } = require('./lib/utils')
const UserRepository = require('../repositories/userRepository')
const { userSchema } = require('../schemas/user')
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

const insertUser = eah(async (req, res, next) => {
  Joi.assert(req.body, userSchema, { abortEarly: false })
  const {
    username, password, email, firstName, lastName, roles,
  } = req.body

  let user = await UserRepository.createUser(email, password, username, firstName, lastName, roles)
  if (!user) {
    return next({ code: 401, message: 'bad request' })
  }
  delete user.password
  if (user.roles.length > 0) {
    user = { ...user, roles: user.roles.map(role => role.role) }
  }

  return res.send({ data: user })
})

const updateUser = eah(async (req, res, next) => {
  Joi.assert(req.body, userSchema, { abortEarly: false })
  const {
    username, password, email, firstName, lastName, roles,
  } = req.body

  const { id } = res.locals

  let user = await UserRepository.updateUser(
    id, email, password, username, firstName, lastName, roles,
  )
  if (!user) {
    return next({ code: 401, message: 'bad request' })
  }
  delete user.password
  if (user.roles.length > 0) {
    user = { ...user, roles: user.roles.map(role => role.role) }
  }

  return res.send({ data: user })
})

const deleteUser = eah(async (req, res, next) => {
  const { id } = res.locals
  const user = await UserRepository.deleteUser({ id })
  if (!user) {
    return next({ code: 401, message: 'bad request' })
  }

  return res.send({ message: 'User deleted' })
})

router.get('/', viewController.index('user', include, manyToMany))
router.get('/:id', viewController.show('user', include, manyToMany))
router.post('/', insertUser)
router.patch('/:id', parseIDToInt, updateUser)
router.delete('/:id', parseIDToInt, deleteUser)
// TODO: add CUD endpoints

module.exports = router
