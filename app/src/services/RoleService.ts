import { Role } from '../entities/Role'
import RoleRepository from '../repositories/RoleRepository'
import { RoleServiceInterface } from '../controllers/roleController'
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

const RoleService: RoleServiceInterface = {
  async fetchRolesWithTotalCount(query) {
    const roles = await RoleRepository.fetchAll(query)
    const roleCounts = await RoleRepository.totalCount()
    return { data: roles, totalCount: roleCounts }
  },

  async fetchRole(id) {
    const role = await RoleRepository.fetch(id)
    if (!role) {
      throw new NotFoundError()
    }
    return role
  },

  async insertRole(query) {
    const duplicate = await RoleRepository.fetchBySlug(query.slug)
    if (duplicate) {
      throw new DuplicateModelError()
    }
    return RoleRepository.insertRole(query.name, query.description, query.slug)
  },

  async updateRole(id, query) {
    const role = await RoleRepository.fetch(id)
    if (!role) {
      throw new NotFoundError()
    }
    return RoleRepository.updateRole(id, query.name, query.description, query.slug)
  },

  async deleteRole(id) {
    const role = await RoleRepository.fetch(id)
    if (!role) {
      throw new NotFoundError()
    }
    return RoleRepository.deleteRole(id)
  },

}

export default RoleService
