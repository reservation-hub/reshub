import { Prisma, Gender as PrismaGender, RoleSlug as PrismaRoleSlug } from '@prisma/client'
import { RoleSlug } from '@entities/Role'
import { Gender, User } from '@entities/User'
import { UserRepositoryInterface } from '@user/services/UserService'
import prisma from '@lib/prisma'
import { OrderBy } from '@entities/Common'

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

const convertEntityRoleSlugToPrismaRoleSlug = (slug: RoleSlug): PrismaRoleSlug => {
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

const convertEntityGenderToDBGender = (gender: Gender): PrismaGender => {
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

const convertEntityOrderToRepositoryOrder = (order: OrderBy): Prisma.SortOrder => {
  switch (order) {
    case OrderBy.ASC:
      return Prisma.SortOrder.asc
    default:
      return Prisma.SortOrder.desc
  }
}

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
  async fetchAllUsers(page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const users = await prisma.user.findMany({
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        profile: true,
        oAuthIds: true,
        role: true,
      },
    })

    const cleanUsers = users.map(user => reconstructUser(user))

    return cleanUsers
  },

  async fetchUser(id) {
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

  async updateUserPassword(id, password) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        password,
      },
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    return reconstructUser(user)
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

  async searchUser(keyword, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const usersResult = await prisma.user.findMany({
      where: { OR: [{ email: { contains: keyword } }, { username: { contains: keyword } }] },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: {
        oAuthIds: true,
        profile: true,
        role: true,
      },
    })
    return usersResult.map(reconstructUser)
  },

  async searchUserTotalCount(keyword) {
    return prisma.user.count({ where: { OR: [{ email: { contains: keyword } }, { username: { contains: keyword } }] } })
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
