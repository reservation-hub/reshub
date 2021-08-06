import { Role } from '../entities/Role'
import RoleRepository from '../repositories/RoleRepository'
import { RoleServiceInterface } from '../controllers/roleController'
import { fetchModelsWithTotalCountQuery } from './ServiceCommonTypes'
import { DuplicateModelError, NotFoundError } from './Errors/ServiceError'

export type upsertRoleQuery = {
  name: string,
  description: string,
  slug: string,
}

export type RoleRepositoryInterface = {
  fetchBySlug(slug: string): Promise<Role | null>,
  insertRole(name: string, description: string, slug: string): Promise<Role>,
  updateRole(id: number, name: string, description: string, slug: string)
  : Promise<Role>,
  deleteRole(id: number): Promise<Role>,
}

export const fetchRolesWithTotalCount = async (query: fetchModelsWithTotalCountQuery)
  : Promise<{ data: Role[], totalCount: number }> => {
  const roles = await RoleRepository.fetchAll(query.page, query.order)
  const roleCounts = await RoleRepository.totalCount()
  return { data: roles, totalCount: roleCounts }
}

export const fetchRole = async (id: number): Promise<Role> => {
  const role = await RoleRepository.fetch(id)
  if (!role) {
    throw new NotFoundError()
  }
  return role
}

export const insertRole = async (query: upsertRoleQuery): Promise<Role> => {
  const duplicate = await RoleRepository.fetchBySlug(query.slug)
  if (duplicate) {
    throw new DuplicateModelError()
  }
  return RoleRepository.insertRole(query.name, query.description, query.slug)
}

export const updateRole = async (id: number, query: upsertRoleQuery): Promise<Role> => {
  const role = await RoleRepository.fetch(id)
  if (!role) {
    throw new NotFoundError()
  }
  return RoleRepository.updateRole(id, query.name, query.description, query.slug)
}

export const deleteRole = async (id: number): Promise<Role> => {
  const role = await RoleRepository.fetch(id)
  if (!role) {
    throw new NotFoundError()
  }
  return RoleRepository.deleteRole(id)
}

const RoleService: RoleServiceInterface = {
  fetchRolesWithTotalCount,
  fetchRole,
  insertRole,
  updateRole,
  deleteRole,
}

export default RoleService
