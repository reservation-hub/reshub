import { UserRepositoryInterface } from '@client/review/services/ReviewService'
import prisma from '@lib/prisma'
import { reconstructUser } from '@lib/prismaConverters/User'

const UserRepository: UserRepositoryInterface = {
  async fetchUsers(userIds) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })

    return users.map(reconstructUser)
  },

  async fetchUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })

    return user ? reconstructUser(user) : null
  },

}

export default UserRepository
