import { Role } from '../entities/Role'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'
import { RoleRepositoryInterface as UserServiceSocket } from '../services/UserService'

import prisma from './prisma'

const RoleRepository:CommonRepositoryInterface<Role> & UserServiceSocket = {

  async isValidRole(id) {
    const role = await prisma.role.findUnique({
      where: { id },
    })
    return role !== null
  },

  async extractValidRoleIds(roleIds) {
    const validRoles = await prisma.role.findMany({
      where: {
        id: { in: roleIds },
      },
    })
    return validRoles.map(validRole => validRole.id)
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
