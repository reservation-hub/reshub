import asyncHandler from 'express-async-handler'
import RoleService, { upsertRoleQuery } from '../services/RoleService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { roleUpsertSchema } from './schemas/role'
import indexSchema from './schemas/indexSchema'
import { Role } from '../entities/Role'

export type RoleServiceInterface = {
  fetchRolesWithTotalCount(query: fetchModelsWithTotalCountQuery): Promise<{ data: Role[], totalCount: number }>,
  fetchRole(id: number): Promise<Role>,
  insertRole(query: upsertRoleQuery): Promise<Role>,
  updateRole(id: number, query: upsertRoleQuery): Promise<Role>,
  deleteRole(id: number): Promise<Role>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
  const rolesWithCount = await RoleService.fetchRolesWithTotalCount(schemaValues)
  return res.send(rolesWithCount)
})

export const showRole = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const role = await RoleService.fetchRole(id)
  return res.send({ data: role })
})

export const insertRole = asyncHandler(async (req, res) => {
  const roleValues = await roleUpsertSchema.validateAsync(req.body, joiOptions)
  const role = await RoleService.insertRole(roleValues)
  return res.send({ data: role })
})

export const updateRole = asyncHandler(async (req, res) => {
  const roleValues = await roleUpsertSchema.validateAsync(req.body, joiOptions)

  const { id } = res.locals

  const role = await RoleService.updateRole(id, roleValues)
  return res.send({ data: role })
})

export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await RoleService.deleteRole(id)
  return res.send({ data: { message: 'Role deleted' } })
})
