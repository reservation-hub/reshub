import {
  Prisma, Gender as PrismaGender, RoleSlug as PrismaRoleSlug,
} from '@prisma/client'
import { Gender, User } from '@entities/User'
import { RoleSlug } from '@entities/Role'

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

export const convertEntityRoleSlugToPrismaRoleSlug = (slug: RoleSlug): PrismaRoleSlug => {
  switch (slug) {
    case RoleSlug.SHOP_STAFF:
      return PrismaRoleSlug.SHOP_STAFF
    case RoleSlug.CLIENT:
      return PrismaRoleSlug.CLIENT
    default:
      return PrismaRoleSlug.ADMIN
  }
}

export const convertDBGenderToEntityGender = (gender: PrismaGender): Gender => {
  switch (gender) {
    case PrismaGender.FEMALE:
      return Gender.FEMALE
    default:
      return Gender.MALE
  }
}

export const convertEntityGenderToDBGender = (gender: Gender): PrismaGender => {
  switch (gender) {
    case Gender.FEMALE:
      return PrismaGender.FEMALE
    default:
      return PrismaGender.MALE
  }
}

const userWithProfileAndOAuthIdsAndRoles = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, role: true } },
)

type userWithProfileAndOAuthIdsAndRoles = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRoles>

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
