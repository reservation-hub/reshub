import { Prisma } from '@prisma/client'
import prisma from './prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'
import {
  Female, Male, Gender, User,
} from '../entities/User'
import { Role } from '../entities/Role'
import { UserRepositoryInterface as UserServiceSocket } from '../services/UserService'
import { UserRepositoryInterface as AuthServiceSocket } from '../services/AuthService'

const userWithProfileAndOAuthIdsAndRoles = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, roles: { include: { role: true } } } },
)

type userWithProfileAndOAuthIdsAndRoles = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRoles>

type userRoles = {
  id: number,
  userId: number,
  roleId: number,
  role: Role
}

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
  username: user.username,
  password: user.password,
  oAuthIds: user.oAuthIds ? {
    id: user.oAuthIds.id,
    googleId: user.oAuthIds.googleId,
    facebookId: user.oAuthIds.facebookId,
  } : null,
  firstNameKanji: user.profile?.firstNameKanji,
  lastNameKanji: user.profile?.lastNameKanji,
  firstNameKana: user.profile?.firstNameKana,
  lastNameKana: user.profile?.lastNameKana,
  roles: user.roles.map((role: userRoles) => role.role),
  birthday: user.profile?.birthday,
  gender: user.profile?.gender ? convertDBGenderToEntityGender(user.profile?.gender) : null,
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
        roles: {
          include: { role: true },
        },
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
        roles: {
          include: { role: true },
        },
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
    roleIds,
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
        roles: {
          create: roleIds.map(id => ({
            role: {
              connect: { id },
            },
          })),
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
        roles: { include: { role: true } },
      },
    })
    const cleanUser = reconstructUser(user)
    return cleanUser
  },

  async updateUserFromAdmin(
    id,
    email,
    lastNameKanji,
    firstNameKanji,
    lastNameKana,
    firstNameKana,
    birthday,
    gender,
    rolesToAdd,
    rolesToRemove,
  ) {
    let removeQuery
    if (rolesToRemove.length > 0) {
      removeQuery = `DELETE from "UserRoles" WHERE user_id = ${id} AND role_id IN (${rolesToRemove.toString()});`
    }

    let roleAddQuery
    if (rolesToAdd.length > 0) {
      roleAddQuery = {
        create: rolesToAdd.map(id => ({
          role: {
            connect: { id },
          },
        })),
      }
    }

    const updateQuery = {
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
        roles: roleAddQuery,
        email,
      },
      include: {
        oAuthIds: true,
        profile: true,
        roles: { include: { role: true } },
      },
    }

    // execute
    if (removeQuery) {
      const transactionResult = await prisma.$transaction([
        prisma.$queryRaw(removeQuery),
        prisma.user.update(updateQuery),
      ])
      const cleanUser = reconstructUser(transactionResult[1])
      return cleanUser
    }

    const user = await prisma.user.update(updateQuery)
    const cleanUser = reconstructUser(user)
    return cleanUser
  },

  async deleteUserFromAdmin(id) {
    const user = await prisma.user.delete({
      where: { id },
      include: {
        oAuthIds: true,
        profile: true,
        roles: { include: { role: true } },
      },
    })
    return reconstructUser(user)
  },

  async fetchByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        oAuthIds: true,
        profile: true,
        roles: { include: { role: true } },
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
