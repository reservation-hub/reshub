import { RoleSlug } from '@prisma/client'
import { UserRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'
import { convertEntityGenderToDBGender, reconstructUser } from '@lib/prismaConverters/User'

const UserRepository: UserRepositoryInterface = {
  async fetchUser(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, oAuthIds: true, role: true },
    })

    return user ? reconstructUser(user) : null
  },

  async insertUser(email, username, password) {
    const create = await prisma.user.create({
      data: {
        email,
        username,
        password,
        role: {
          connect: { slug: RoleSlug.CLIENT },
        },
        profile: {
          create: {
            firstNameKana: '',
            lastNameKana: '',
            firstNameKanji: '',
            lastNameKanji: '',
          },
        },
      },

      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })
    const createdUser = reconstructUser(create)
    return createdUser
  },

  async updateUser(id, lastNameKanji, firstNameKanji, lastNameKana, firstNameKana,
    gender, birthday) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            lastNameKanji,
            firstNameKanji,
            lastNameKana,
            firstNameKana,
            gender: convertEntityGenderToDBGender(gender),
            birthday,
          },
        },
      },
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    return reconstructUser(user)
  },

  async updateUserPassword(id, password) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        password,
      },
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    return reconstructUser(user)
  },

  async emailAndUsernameAreAvailable(email, username) {
    const emailCount = await prisma.user.count(
      {
        where: {
          email,
          OR: {
            username,
          },
        },
      },
    )
    return emailCount === 0
  },

}

export default UserRepository
