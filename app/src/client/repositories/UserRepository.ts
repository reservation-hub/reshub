import { Prisma, RoleSlug } from '@prisma/client'
import { User } from '@entities/User'
import prisma from '@repositories/prisma'
import { UserRepositoryInterface } from '@client/services/SignUpService'
import { UserRepositoryInterface as AuthServiceSocket } from '@client/services/AuthService'
import { convertRoleSlug } from '@repositories/UserRepository'

const userWithProfileAndOAuthIdsAndRole = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, role: true } },
)

type userWithProfileAndOAuthIdsAndRole = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRole>

const reconstructUser = (user: userWithProfileAndOAuthIdsAndRole): User => ({
  id: user.id,
  email: user.email,
  username: user.username ?? undefined,
  password: user.password,
  firstNameKana: user.profile.firstNameKana,
  lastNameKana: user.profile.lastNameKana,
  firstNameKanji: user.profile.firstNameKanji,
  lastNameKanji: user.profile.lastNameKanji,
  oAuthIds: user.oAuthIds ? {
    id: user.oAuthIds.id,
    googleId: user.oAuthIds.googleId,
    facebookId: user.oAuthIds.facebookId,
  } : undefined,
  role: {
    id: user.roleId,
    name: user.role.name,
    description: user.role.description,
    slug: convertRoleSlug(user.role.slug),
  },
})

const UserRepository: UserRepositoryInterface & AuthServiceSocket = {

  async fetch(id) {
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
      include: { profile: true, oAuthIds: true, role: true },
    })
    return user ? reconstructUser(user) : null
  },

}

export default UserRepository
