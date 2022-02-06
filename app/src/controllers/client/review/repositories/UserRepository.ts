import { Prisma, Gender as PrismaGender, RoleSlug as PrismaRoleSlug } from '@prisma/client'
import { RoleSlug } from '@entities/Role'
import { Gender, User } from '@entities/User'
import { UserRepositoryInterface } from '@client/review/services/ReviewService'
import prisma from '@lib/prisma'

const convertRoleSlug = (slug: PrismaRoleSlug): RoleSlug => {
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

const userWithProfileAndOAuthIdsAndRoles = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, role: true } },
)

type userWithProfileAndOAuthIdsAndRoles = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRoles>

const reconstructUser = (user: userWithProfileAndOAuthIdsAndRoles): User => ({
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

const UserRepository: UserRepositoryInterface = {
  async fetchUsers(userIds) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })

    return users.map(reconstructUser)
  },

  async fetchUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })

    return user ? reconstructUser(user) : null
  },

}

export default UserRepository
