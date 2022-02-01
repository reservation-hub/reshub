import { UserRepositoryInterface } from '@client/shop/services/ReviewService'
import prisma from '@lib/prisma'

const UserRepository: UserRepositoryInterface = {
  async fetchUserNames(userIds) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { profile: true },
    })
    return userIds.map(userId => ({
      userId,
      lastNameKanji: users.find(u => u.id === userId)!.profile.lastNameKanji,
      firstNameKanji: users.find(u => u.id === userId)!.profile.firstNameKanji,
    }))
  },
}

export default UserRepository
