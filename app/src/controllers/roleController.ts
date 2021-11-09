import {
  Router, Request, Response, NextFunction,
} from 'express'
import RoleService from '../services/RoleService'
import { insertRoleQuery, updateRoleQuery } from '../request-response-types/RoleService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { roleUpsertSchema } from './schemas/role'
import indexSchema from './schemas/indexSchema'
import { Role } from '../entities/Role'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import { searchSchema } from './schemas/search'

export type RoleServiceInterface = {
  fetchRolesWithTotalCount(query: fetchModelsWithTotalCountQuery): Promise<{ data: Role[], totalCount: number }>,
  fetchRole(id: number): Promise<Role>,
  insertRole(query: insertRoleQuery): Promise<Role>,
  updateRole(query: updateRoleQuery): Promise<Role>,
  deleteRole(id: number): Promise<Role>,
  searchRoles(keyword: string): Promise<Role[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)
    const rolesWithCount = await RoleService.fetchRolesWithTotalCount(schemaValues)
    return res.send(rolesWithCount)
  } catch (e) { return next(e) }
}

export const showRole = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    const role = await RoleService.fetchRole(id)
    return res.send(role)
  } catch (e) { return next(e) }
}

export const insertRole = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await roleUpsertSchema.validateAsync(req.body, joiOptions)
    const role = await RoleService.insertRole(params)
    return res.send(role)
  } catch (e) { return next(e) }
}

export const searchRoles = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
    const role = await RoleService.searchRoles(searchValues.keyword)

    return res.send({ data: role })
  } catch (e) { return next(e) }
}

export const updateRole = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await roleUpsertSchema.validateAsync(req.body, joiOptions)

    const { id } = res.locals

    const role = await RoleService.updateRole({ id, params })
    return res.send(role)
  } catch (e) { return next(e) }
}

export const deleteRole = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    await RoleService.deleteRole(id)
    return res.send({ message: 'Role deleted' })
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showRole)
routes.post('/', roleCheck(['admin']), insertRole)
routes.post('/search', searchRoles)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateRole)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteRole)

export default routes
