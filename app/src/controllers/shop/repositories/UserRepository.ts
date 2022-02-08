import { UserRepositoryInterface as UserServiceSocket } from '@shop/services/UserService'
import { UserRepositoryInterface as ShopServiceSocket } from '@shop/services/ShopService'
import prisma from '@lib/prisma'
import { reconstructUser } from '@prismaConverters/User'

const UserRepository: UserServiceSocket & ShopServiceSocket = {

  async fetchUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, oAuthIds: true, role: true },
    })
    return user ? reconstructUser(user) : null
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
