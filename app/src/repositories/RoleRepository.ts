import { Role } from '@entities/Role'
import { RoleRepositoryInterface as UserServiceSocket } from '@services/UserService'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

import prisma from './prisma'

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
    return prisma.role.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
  },

  async totalCount() {
    return prisma.role.count()
  },

  async fetch(id) {
    return prisma.role.findUnique({
      where: { id },
    })
  },

}

export default RoleRepository
