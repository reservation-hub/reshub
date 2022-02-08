import { UserRepositoryInterface } from '@user/services/UserService'
import prisma from '@lib/prisma'
import { convertEntityOrderToRepositoryOrder } from '@lib/prismaConverters/Common'
import { convertEntityGenderToDBGender, convertEntityRoleSlugToPrismaRoleSlug, reconstructUser }
  from '@lib/prismaConverters/User'

const UserRepository: UserRepositoryInterface = {
  async fetchAllUsers(page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const users = await prisma.user.findMany({
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })

    const cleanUsers = users.map(user => reconstructUser(user))

    return cleanUsers
  },

  async fetchUser(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })
    return user ? reconstructUser(user) : null
  },

  async totalCount() {
    return prisma.user.count()
  },

  async insertUser(
    email, password, roleSlug, lastNameKanji, firstNameKanji,
    lastNameKana, firstNameKana, birthday, gender,
  ) {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: {
          connect: { slug: convertEntityRoleSlugToPrismaRoleSlug(roleSlug) },
        },
        profile: {
          create: {
            lastNameKanji,
            firstNameKanji,
            lastNameKana,
            firstNameKana,
            birthday,
            gender: convertEntityGenderToDBGender(gender),
          },
        },
      },
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })
    const cleanUser = reconstructUser(user)
    return cleanUser
  },

  async updateUser(
    id, email, roleSlug, lastNameKanji, firstNameKanji,
    lastNameKana, firstNameKana, birthday, gender,
  ) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            firstNameKanji,
            lastNameKanji,
            firstNameKana,
            lastNameKana,
            birthday,
            gender: convertEntityGenderToDBGender(gender),
          },
        },
        role: { connect: { slug: convertEntityRoleSlugToPrismaRoleSlug(roleSlug) } },
        email,
      },
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    const cleanUser = reconstructUser(user)
    return cleanUser
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

  async deleteUser(id) {
    const user = await prisma.user.delete({
      where: { id },
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    return reconstructUser(user)
  },

  async searchUser(keyword, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const usersResult = await prisma.user.findMany({
      where: { OR: [{ email: { contains: keyword } }, { username: { contains: keyword } }] },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    return usersResult.map(reconstructUser)
  },

  async searchUserTotalCount(keyword) {
    return prisma.user.count({ where: { OR: [{ email: { contains: keyword } }, { username: { contains: keyword } }] } })
  },

  async fetchUserByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    return user ? reconstructUser(user) : null
  },

}

export default UserRepository
