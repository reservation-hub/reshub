import { UserRepositoryInterface as ReservationServiceSocket } from '@reservation/services/ReservationService'
import prisma from '@lib/prisma'
import { reconstructUser } from '@prismaConverters/User'

const UserRepository: ReservationServiceSocket = {
  async fetchUsersByIds(userIds) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { profile: true, oAuthIds: true, role: true },
    })
    return users.map(u => reconstructUser(u))
  },

  async userExists(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return Boolean(user)
  },
}

export default UserRepository
