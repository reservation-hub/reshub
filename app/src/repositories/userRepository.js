const prisma = require('../db/prisma')

module.exports = {
  async createUser(
    email,
    password,
    username,
    firstName,
    lastName,
    roles,
  ) {
    try {
      return prisma.user.create({
        data: {
          roles: {
            create: roles.map(roleID => ({
              role: {
                connect: {
                  id: roleID,
                },
              },
            })),
          },
          profile: {
            create: {
              firstName,
              lastName,
            },
          },
          email,
          password,
          username,
        },
        include: {
          profile: true,
          oAuthIDs: true,
          roles: {
            include: { role: true },
          },
        },
      })
    } catch (e) { return e }
  },
  async updateUser(
    id,
    email,
    password,
    username,
    firstName,
    lastName,
    roles,
  ) {
    try {
      // validate if roles are valid
      const validRoleCount = await prisma.$queryRaw(`SELECT COUNT(*) FROM "Role" where id in (${roles.toString()});`)
      if (validRoleCount[0].count !== roles.length) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: { include: { role: true } },
        },
      })
      const userRolesIDs = user.roles.map(role => role.role.id)
      const rolesToadd = roles.filter(userRoleID => userRolesIDs.indexOf(userRoleID) === -1)
      const rolesToRemove = userRolesIDs.filter(userRoleID => roles.indexOf(userRoleID) === -1)

      // remove roles from user
      let removeQuery
      if (rolesToRemove.length > 0) {
        removeQuery = `DELETE FROM "UserRoles" WHERE user_id = ${id} AND role_id IN (${rolesToRemove.toString()});`
      }

      let roleAddQuery
      if (rolesToadd.length > 0) {
        roleAddQuery = {
          create: rolesToadd.map(roleID => ({
            role: {
              connect: { id: roleID },
            },
          })),
        }
      }

      const updateQuery = {
        where: { id },
        data: {
          profile: {
            update: {
              firstName,
              lastName,
            },
          },
          roles: roleAddQuery,
          email,
          password,
          username,
        },
        include: {
          profile: true,
          oAuthIDs: true,
          roles: {
            include: { role: true },
          },
        },
      }

      // execute
      if (removeQuery) {
        const transactionResult = await prisma.$transaction([
          prisma.$queryRaw(removeQuery),
          prisma.user.update(updateQuery),
        ])
        return transactionResult[1]
      }
      // eslint-disable-next-line no-console
      console.log('SHOULD ADD')
      return prisma.user.update(updateQuery)
    } catch (e) { return e }
  },
  async deleteUser(id) {
    try {
      return prisma.user.delete({
        where: { id },
      })
    } catch (e) { return e }
  },
  async findByOAuth(id) {
    try {
      return prisma.user.findUnique({
        where: {
          oAuthIDs: id,
        },
      })
    } catch (e) { return e }
  },
  async upsert(
    email,
    username,
    password,
    firstName,
    lastName,
    roles,
  ) {
    try {
      return prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          username,
          password,
          profile: {
            create: {
              firstName,
              lastName,
            },
          },
          roles: {
            create: roles.map(role => ({
              role: {
                connect: {
                  id: role.id,
                },
              },
            })),
          },
        },
      })
    } catch (e) { return e }
  },
  async findByProps(prop) {
    const param = Array.isArray(prop) ? { OR: prop } : prop
    try {
      const user = await prisma.user.findUnique({
        where: param,
        include: {
          profile: true,
          oAuthIDs: true,
          roles: {
            include: { role: true },
          },
        },
      })

      return user
    } catch (e) { return e }
  },
  async addOAuthID(user, oAuth) {
    switch (oAuth.provider) {
      case 'google':
        if (!user.oAuthIDs.googleID) {
          return prisma.userOAuthIds.upsert({
            where: { userID: user.id },
            update: {
              googleID: oAuth.id,
            },
            create: {
              googleID: oAuth.id,
              user: {
                connect: { id: user.id },
              },
            },
          })
        }
        return null
      default:
        return null
    }
  },
}
