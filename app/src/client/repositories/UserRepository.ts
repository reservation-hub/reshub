import { Prisma } from '@prisma/client'
import { User } from '../../entities/User'
import prisma from '../../repositories/prisma'
import { Role } from '../../entities/Role'
import { UserRepositoryInterface } from '../services/SignUpService'
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

const reconstructUser = (user: userWithProfileAndOAuthIdsAndRoles): User => ({
  id: user.id,
  email: user.email,
  username: user.username ?? null,
  password: user.password,
  oAuthIds: user.oAuthIds ? {
    id: user.oAuthIds.id,
    googleId: user.oAuthIds.googleId,
    facebookId: user.oAuthIds.facebookId,
  } : null,
  roles: user.roles.map((role: userRoles) => role.role),
})

const UserRepository: UserRepositoryInterface & AuthServiceSocket = {

  async fetch(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, oAuthIds: true, roles: { include: { role: true } } },
    })
    return user ? reconstructUser(user) : null
  },

  async insertUser(email, username, password) {
    const create = await prisma.user.create({
      data: {
        email,
        username,
        password,
        roles: {
          create: {
            role: {
              connect: { slug: 'client' },
            },
          },
        },
      },

      include: {
        profile: true,
        oAuthIds: true,
        roles: { include: { role: true } },
      },
    })
    const createdUser = reconstructUser(create)
    return createdUser
  },

  async emailIsAvailable(email) {
    const emailCount = await prisma.user.count(
      {
        where: {
          email,
        },
      },
    )
    return emailCount === 0
  },

  async fetchByUsername(username) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { profile: true, oAuthIds: true, roles: { include: { role: true } } },
    })
    return user ? reconstructUser(user) : null
  },

}

export default UserRepository
