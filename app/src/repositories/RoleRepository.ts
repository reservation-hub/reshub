import { Role } from '@entities/Role'
import { Role as PrismaRole } from '@prisma/client'
import { RoleRepositoryInterface as UserServiceSocket } from '@services/UserService'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

import prisma from './prisma'
import { convertRoleSlug } from './UserRepository'

const reconstructRole = (role: PrismaRole): Role => ({
  id: role.id,
  name: role.name,
  description: role.description,
  slug: convertRoleSlug(role.slug),
})

const RoleRepository:CommonRepositoryInterface<Role> & UserServiceSocket = {

  async isValidRole(slug) {
    const role = await prisma.role.findUnique({
      where: { slug },
    })
    return role !== null
  },

  async extractValidRoleSlugs(roleSlugs) {
    const validRoles = await prisma.role.findMany({
      where: {
        slug: { in: roleSlugs },
      },
    })
    return validRoles.map(validRole => validRole.slug)
  },

  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const roles = await prisma.role.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
    return roles.map(r => reconstructRole(r))
  },

  async totalCount() {
    return prisma.role.count()
  },

  async fetch(id) {
    const role = await prisma.role.findUnique({
      where: { id },
    })
    return role ? reconstructRole(role) : null
  },

}

export default RoleRepository
