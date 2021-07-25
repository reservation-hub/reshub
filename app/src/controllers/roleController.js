const router = require('express').Router()
const eah = require('express-async-handler')
const viewController = require('./lib/viewController')
const { parseIntIDMiddleware } = require('./lib/utils')
const { roleUpsertSchema } = require('./schemas/role')
const RoleRepository = require('../repositories/RoleRepository')

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

  if (roleSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: roleSchemaError })
  }

  const { id } = res.locals

  const {
    error: roleFetchError,
    value: role,
  } = await RoleRepository.findByProps({ id })
  if (roleFetchError) {
    return next({ code: 500, message: 'Server Error', error: roleFetchError })
  }
  if (!role) {
    return next({ code: 404, message: 'Role not found' })
  }

  const {
    error,
    value: updatedRole,
  } = await RoleRepository.updateRole(
    id, roleInsertValues.name,
    roleInsertValues.description, roleInsertValues.slug,
  )

  if (error) {
    return next({ code: 400, message: 'Invalid input values', error })
  }

  return res.send({ data: updatedRole })
})

const deleteRole = eah(async (req, res, next) => {
  const { id } = res.locals

  const { error } = await RoleRepository.deleteRole(id)
  if (error) {
    return next({ code: 404, message: 'Role not found', error })
  }

  return res.send({ data: { message: 'Role deleted' } })
})

router.get('/', viewController.index('role'))
router.get('/:id', viewController.show('role'))
router.post('/', insertRole)
router.patch('/:id', parseIntIDMiddleware, updateRole)
router.delete('/:id', parseIntIDMiddleware, deleteRole)

module.exports = router
