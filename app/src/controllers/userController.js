const router = require('express').Router()
const eah = require('express-async-handler')
const { parseIntIDMiddleware } = require('./lib/utils')
const UserRepository = require('../repositories/UserRepository')
const RoleRepository = require('../repositories/RoleRepository')
const {
  userInsertSchema, userUpdateSchema, userProfileUpsertSchema,
} = require('./schemas/user')
const viewController = require('./lib/viewController')

const include = {
  profile: true,
  oAuthIDs: true,
  roles: {
    include: {
      role: true,
    },
  },
}

const manyToMany = 'roles'

const joiOptions = { abortEarly: false, stripUnknown: true }

const insertUser = eah(async (req, res, next) => {
  const {
    error: userValuesError,
    value: userValues,
  } = userInsertSchema.validate(req.body, joiOptions)

  if (userValuesError) {
    return next({ code: 400, message: 'Invalid input values', error: userValuesError })
  }

  if (userValues.password !== userValues.confirm) {
    return next({ code: 400, message: 'Passwords did not match!' })
  }
  delete userValues.confirm

  const {
    error: userProfileValuesError,
    value: userProfileValues,
  } = userProfileUpsertSchema.validate(req.body, joiOptions)

  if (userProfileValuesError) {
    return next({ code: 400, message: 'Invalid input values', error: userProfileValuesError })
  }

  const {
    error: roleExtractionError,
    value: validRoleIDs,
  } = await RoleRepository.extractValidRoleIDs(userValues.roles)

  if (roleExtractionError) {
    return ({ code: 400, message: 'Invalid input values', error: roleExtractionError })
  }

  const {
    error: createUserError,
    value: user,
  } = await UserRepository
    .createUser(userValues.email, userValues.password,
      userValues.username, userProfileValues, validRoleIDs)

  if (createUserError) {
    return next({ code: 400, message: 'User was not create', error: createUserError })
  }

  delete user.password
  return res.send({ data: user })
})

const updateUser = eah(async (req, res, next) => {
  const {
    error: userValuesError,
    value: userValues,
  } = userUpdateSchema.validate(req.body, joiOptions)

  if (userValuesError) {
    return next({ code: 400, message: 'Invalid input', error: userValuesError })
  }

  const {
    error: userProfileValuesError,
    value: userProfileValues,
  } = userProfileUpsertSchema.validate(req.body, joiOptions)

  if (userProfileValuesError) {
    return next({ code: 400, message: 'Invalid input', error: userProfileValuesError })
  }

  const {
    error: roleExtractionError,
    value: validRoleIDs,
  } = await RoleRepository.extractValidRoleIDs(userValues.roles)

  if (roleExtractionError) {
    return ({ code: 400, message: 'Invalid input values', error: roleExtractionError })
  }

  const { id } = res.locals

  const {
    error: userFetchError,
    value: user,
  } = await UserRepository.findByProps({ id })
  if (userFetchError) {
    return next({ code: 500, message: 'Server Error', error: userFetchError })
  }
  if (!user) {
    return next({ code: 404, message: 'User Not Found' })
  }

  const userRoleIDs = user.roles.map(role => role.role.id)
  const rolesToAdd = validRoleIDs.filter(validRoleID => userRoleIDs.indexOf(validRoleID) === -1)
  const rolesToRemove = userRoleIDs.filter(uuid => validRoleIDs.indexOf(uuid) === -1)

  const { error: updateUserError, value: updatedUser } = await UserRepository.updateUser(
    id, userValues.email, userValues.password, userValues.username,
    userProfileValues, rolesToAdd, rolesToRemove,
  )

  if (updateUserError) {
    console.error('update user error : ', updateUserError)
    return next({ code: 400, message: 'update user error', error: updateUserError })
  }

  delete updatedUser.password
  return res.send({ data: updatedUser })
})

const deleteUser = eah(async (req, res, next) => {
  const { id } = res.locals
  const { error } = await UserRepository.deleteUser(id)
  if (error) {
    return next({ code: 404, message: 'User not found', error })
  }

  return res.send({ data: { message: 'User deleted' } })
})

router.get('/', viewController.index('user', include, manyToMany))
router.get('/:id', viewController.show('user', include, manyToMany))
router.post('/', insertUser)
router.patch('/:id', parseIntIDMiddleware, updateUser)
router.delete('/:id', parseIntIDMiddleware, deleteUser)

module.exports = router
