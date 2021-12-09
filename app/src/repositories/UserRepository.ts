import { Prisma } from '@prisma/client'
import {
  Female, Male, Gender, User,
} from '@entities/User'
import { UserRepositoryInterface as UserServiceSocket } from '@services/UserService'
import { UserRepositoryInterface as AuthServiceSocket } from '@services/AuthService'
import prisma from './prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

const userWithProfileAndOAuthIdsAndRoles = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, role: true } },
)

type userWithProfileAndOAuthIdsAndRoles = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRoles>

export const convertEntityGenderToDBGender = (gender: Gender): string => {
  switch (gender) {
    case Female:
      return '1'
    default:
      return '0'
  }
}

const convertDBGenderToEntityGender = (gender: string): Gender => {
  switch (gender) {
    case '1':
      return Female
    default:
      return Male
  }
}

export const reconstructUser = (user: userWithProfileAndOAuthIdsAndRoles): User => ({
  id: user.id,
  email: user.email,
  username: user.username ?? undefined,
  password: user.password,
  oAuthIds: user.oAuthIds ? {
    id: user.oAuthIds.id,
    googleId: user.oAuthIds.googleId,
    facebookId: user.oAuthIds.facebookId,
  } : undefined,
  firstNameKanji: user.profile?.firstNameKanji,
  lastNameKanji: user.profile?.lastNameKanji,
  firstNameKana: user.profile?.firstNameKana,
  lastNameKana: user.profile?.lastNameKana,
  role: user.role!,
  birthday: user.profile!.birthday ?? undefined,
  gender: user.profile!.gender ? convertDBGenderToEntityGender(user.profile!.gender) : undefined,
})

const UserRepository: CommonRepositoryInterface<User > & UserServiceSocket & AuthServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const users = await prisma.user.findMany({
      skip: skipIndex,
      orderBy: { id: order },
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

  async fetch(id) {
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

  async insertUserWithProfile(
    email,
    password,
    roleSlug,
    lastNameKanji,
    firstNameKanji,
    lastNameKana,
    firstNameKana,
    birthday,
    gender,
  ) {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: {
          connect: { slug: roleSlug },
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

  async updateUserFromAdmin(
    id,
    email,
    roleSlug,
    lastNameKanji,
    firstNameKanji,
    lastNameKana,
    firstNameKana,
    birthday,
    gender,
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
        role: { connect: { slug: roleSlug } },
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

  async deleteUserFromAdmin(id) {
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

  async searchUser(keyword) {
    const usersResult = await prisma.user.findMany({
      where: { OR: [{ email: { contains: keyword } }, { username: { contains: keyword } }] },
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    const users = usersResult.map(user => reconstructUser(user))
    return users
  },
  async fetchByEmail(email) {
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

  async addOAuthId(id, provider, authId) {
    const updateQuery = {
      where: { id },
      data: {
        oAuthIds: {
          upsert: {
            update: {},
            create: {},
          },
        },
      },
    }

    switch (provider) {
      case 'google':
        Object.assign(updateQuery.data.oAuthIds.upsert.create, { googleId: authId })
        Object.assign(updateQuery.data.oAuthIds.upsert.update, { googleId: authId })
        break
      default:
    }

    const user = await prisma.user.update(updateQuery)
    return !!user
  },
}

export default UserRepository
