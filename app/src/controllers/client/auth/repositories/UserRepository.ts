import { Prisma, Gender as PrismaGender, RoleSlug as PrismaRoleSlug } from '@prisma/client'
import { RoleSlug } from '@entities/Role'
import { Gender, User } from '@entities/User'
import { UserRepositoryInterface as AuthServiceSocket } from '@client/auth/services/AuthService'
import prisma from '@lib/prisma'
import { UserRepositoryInterface as UserServiceSocket } from '@client/auth/services/UserService'

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

const convertDBGenderToEntityGender = (gender: PrismaGender): Gender => {
  switch (gender) {
    case PrismaGender.FEMALE:
      return Gender.FEMALE
    default:
      return Gender.MALE
  }
}

const reconstructUser = (user: userWithProfileAndOAuthIdsAndRole): User => ({
  id: user.id,
  email: user.email,
  username: user.username ?? undefined,
  password: user.password,
  oAuthIds: user.oAuthIds ? {
    id: user.oAuthIds.id,
    googleId: user.oAuthIds.googleId,
    facebookId: user.oAuthIds.facebookId,
  } : undefined,
  firstNameKanji: user.profile.firstNameKanji,
  lastNameKanji: user.profile.lastNameKanji,
  firstNameKana: user.profile.firstNameKana,
  lastNameKana: user.profile.lastNameKana,
  role: {
    id: user.roleId,
    name: user.role.name,
    description: user.role.description,
    slug: convertRoleSlug(user.role.slug),
  },
  birthday: user.profile.birthday ?? undefined,
  gender: user.profile!.gender ? convertDBGenderToEntityGender(user.profile!.gender) : undefined,
})

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
      where: { role: { slug: PrismaRoleSlug.CLIENT } },
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
