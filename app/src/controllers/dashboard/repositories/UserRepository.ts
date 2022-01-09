import { Prisma, Gender as PrismaGender, RoleSlug as PrismaRoleSlug } from '@prisma/client'
import { Gender, User } from '@entities/User'
import { UserRepositoryInterface as UserServiceSocket } from '@dashboard/services/UserService'
import { RoleSlug } from '@entities/Role'
import { UserRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import prisma from '@lib/prisma'

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

const userWithProfileAndOAuthIdsAndRoles = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, role: true } },
)

type userWithProfileAndOAuthIdsAndRoles = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRoles>

const convertDBGenderToEntityGender = (gender: PrismaGender): Gender => {
  switch (gender) {
    case PrismaGender.FEMALE:
      return Gender.FEMALE
    default:
      return Gender.MALE
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

const UserRepository: UserServiceSocket & ReservationServiceSocket = {
  async fetchUsers() {
    const limit = 5
    const users = await prisma.user.findMany({
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

  async totalCount() {
    return prisma.user.count()
  },

  async fetchUsersByIds(userIds) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { profile: true, oAuthIds: true, role: true },
    })
    return users.map(u => reconstructUser(u))
  },

}

export default UserRepository
