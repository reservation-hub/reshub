import { UserRepositoryInterface as AuthServiceSocket } from '@client/auth/services/AuthService'
import prisma from '@lib/prisma'
import { UserRepositoryInterface as UserServiceSocket } from '@client/auth/services/UserService'
import { reconstructUser } from '@lib/prismaConverters/User'
import { RoleSlug } from '@prisma/client'

const UserRepository: AuthServiceSocket & UserServiceSocket = {

  async fetch(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, oAuthIds: true, role: true },
    })
    return user ? reconstructUser(user) : null
  },

  async fetchByUsername(username) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { profile: true, oAuthIds: true, role: true },
    })
    return user ? reconstructUser(user) : null
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

  async fetchClient() {
    const user = await prisma.user.findFirst({
      where: { role: { slug: RoleSlug.CLIENT } },
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
