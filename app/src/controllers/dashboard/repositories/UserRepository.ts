import { UserRepositoryInterface as UserServiceSocket } from '@dashboard/services/UserService'
import { UserRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import prisma from '@lib/prisma'
import { reconstructUser } from '@prismaConverters/User'

const UserRepository: UserServiceSocket & ReservationServiceSocket = {
  async fetchUsers() {
    const limit = 5
    const users = await prisma.user.findMany({
      take: limit,
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })

    const cleanUsers = users.map(user => reconstructUser(user))

    return cleanUsers
  },

  async totalCount() {
    return prisma.user.count()
  },

  async fetchUsersByIds(userIds) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { profile: true, oAuthIds: true, role: true },
    })
    return users.map(u => reconstructUser(u))
  },

}

export default UserRepository
