import { Prisma, Gender as PrismaGender, RoleSlug as PrismaRoleSlug } from '@prisma/client'
import { RoleSlug } from '@entities/Role'
import { Gender, User } from '@entities/User'
import { UserRepositoryInterface } from '@user/services/UserService'
import prisma from '@/prisma'

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

const userWithProfileAndOAuthIdsAndRoles = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, role: true } },
)

type userWithProfileAndOAuthIdsAndRoles = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRoles>

export const convertEntityGenderToDBGender = (gender: Gender): PrismaGender => {
  switch (gender) {
    case Gender.FEMALE:
      return PrismaGender.FEMALE
    default:
      return PrismaGender.MALE
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

const UserRepository: UserRepositoryInterface = {
  async fetchAll(page, order) {
    const limit = 10
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

  async insertUser(
    email, password, roleSlug, lastNameKanji, firstNameKanji,
    lastNameKana, firstNameKana, birthday, gender,
  ) {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: {
          connect: { slug: convertEntityRoleSlugToPrismaRoleSlug(roleSlug) },
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

  async updateUser(
    id, email, roleSlug, lastNameKanji, firstNameKanji,
    lastNameKana, firstNameKana, birthday, gender,
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
        role: { connect: { slug: convertEntityRoleSlugToPrismaRoleSlug(roleSlug) } },
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

  async deleteUser(id) {
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
  async fetchUserByEmail(email) {
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

}

export default UserRepository
