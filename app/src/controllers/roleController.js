const router = require('express').Router()
const eah = require('express-async-handler')
const { viewController } = require('./lib/viewController')
const { parseIntIDMiddleware } = require('./lib/utils')
const { roleUpsertSchema } = require('./schemas/role')
const RoleRepository = require('../repositories/roleRepository')

const joiOptions = { abortEarly: false, stripUnknown: true }

const insertRole = eah(async (req, res, next) => {
  const {
    error: roleSchemaError,
    value: roleInsertValues,
  } = roleUpsertSchema.validate(req.body, joiOptions)

  if (roleSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: roleSchemaError })
  }

  const {
    error,
    value: role,
  } = await RoleRepository.createRole(roleInsertValues.name,
    roleInsertValues.description, roleInsertValues.slug)

  if (error) {
    return next({ code: 400, message: 'Invalid input values', error })
  }

  return res.send({ data: role })
})

const updateRole = eah(async (req, res, next) => {
  const {
    error: roleSchemaError,
    value: roleInsertValues,
  } = roleUpsertSchema.validate(req.body, joiOptions)

  const { id } = res.locals

  if (roleSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: roleSchemaError })
  }

  const {
    error,
    value: role,
  } = await RoleRepository.updateRole(id, roleInsertValues.name,
    roleInsertValues.description, roleInsertValues.slug)

  if (error) {
    return next({ code: 400, message: 'Invalid input values', error })
  }

  return res.send({ data: role })
})

const deleteRole = eah(async (req, res, next) => {
  const { id } = res.locals

  const {
    error,
    value: role,
  } = await RoleRepository.deleteRole(id)

  if (error) {
    return next({ code: 400, message: 'Invalid input values', error })
  }

  return res.send({ data: role })
})

router.get('/', viewController.index('role'))
router.get('/:id', viewController.show('role'))
router.post('/', insertRole)
router.patch('/:id', parseIntIDMiddleware, updateRole)
router.delete('/:id', parseIntIDMiddleware, deleteRole)

module.exports = router
