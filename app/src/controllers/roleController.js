const router = require('express').Router()
const eah = require('express-async-handler')
const { parseIntIDMiddleware } = require('./lib/utils')
const { roleUpsertSchema } = require('./schemas/role')
const RoleRepository = require('../repositories/RoleRepository')
const indexSchema = require('./schemas/indexSchema')

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = eah(async (req, res, next) => {
  const {
    error: schemaError,
    value: schemaValues,
  } = indexSchema.validate(req.query, joiOptions)
  if (schemaError) {
    return next({ code: 400, message: 'Invalid input values', error: schemaError })
  }

  const {
    error: fetchRolesError,
    value: roles,
  } = await RoleRepository.fetchRoles(schemaValues.page, schemaValues.order, schemaValues.filter)
  if (fetchRolesError) {
    return next({ code: 500, message: 'Server error', error: fetchRolesError })
  }

  const {
    error: fetchCountError,
    value: roleCounts,
  } = await RoleRepository.totalCount(schemaValues.filter)
  if (fetchCountError) {
    return next({ code: 500, message: 'Server error', error: fetchCountError })
  }

  return res.send({ data: roles, totalCount: roleCounts })
})

const showRole = eah(async (req, res, next) => {
  const { id } = res.locals
  const { error, value } = await RoleRepository.fetchRole(id)
  if (error) {
    return next({ code: 500, message: 'Server error', error })
  }
  if (!value) {
    return next({ code: 404, message: 'Role Not Found' })
  }
  return res.send({ data: value })
})

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

router.get('/', index)
router.get('/:id', parseIntIDMiddleware, showRole)
router.post('/', insertRole)
router.patch('/:id', parseIntIDMiddleware, updateRole)
router.delete('/:id', parseIntIDMiddleware, deleteRole)

module.exports = router
