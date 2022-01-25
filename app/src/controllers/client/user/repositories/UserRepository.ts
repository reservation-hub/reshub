import { Prisma, RoleSlug as PrismaRoleSlug } from '@prisma/client'
import { RoleSlug } from '@entities/Role'
import { UserRepositoryInterface } from '@client/user/services/UserService'
import { User } from '@entities/User'
import prisma from '@lib/prisma'

const userWithProfileAndOAuthIdsAndRole = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, role: true } },
)

type userWithProfileAndOAuthIdsAndRole = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRole>

export const convertRoleSlug = (slug: PrismaRoleSlug): RoleSlug => {
  switch (slug) {
    case PrismaRoleSlug.SHOP_STAFF:
      return RoleSlug.SHOP_STAFF
    case PrismaRoleSlug.CLIENT:
      return RoleSlug.CLIENT
    default:
      return RoleSlug.ADMIN
  }
}

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

const UserRepository: UserRepositoryInterface = {

  async insertUser(email, username, password) {
    const create = await prisma.user.create({
      data: {
        email,
        username,
        password,
        role: {
          connect: { slug: PrismaRoleSlug.CLIENT },
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
