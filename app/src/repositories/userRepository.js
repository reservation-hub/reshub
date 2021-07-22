const prisma = require('../db/prisma')

module.exports = {
  /**
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @param {string} firstName
   * @param {string} lastName
   * @param {[integer]} roles
   * 
   * @returns {object}
   * @throws {null} 
   */
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
    } catch (e) {
      console.error(e)
      return null
    }
  },
  /**
   * @param {id} id
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @param {string} firstName
   * @param {string} lastName
   * @param {[integer]} roles
   * 
   * @returns {object}
   * @throws {null} 
   */
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
      return prisma.user.update(updateQuery)
    } catch (e) {
      console.error(e)
      return null
    }
  },
  /**
   * @param {integer} id
   * 
   * @returns {object}
   * @throws {null} 
   */
  async deleteUser(id) {
    try {
      return prisma.user.delete({
        where: { id },
      })
    } catch (e) {
      console.error(e)
      return null
    }
  },
  async findByOAuth(id) {
    try {
      return prisma.user.findUnique({
        where: {
          oAuthIDs: id,
        },
      })
    } catch (e) {
      console.error(e)
      return null
    }
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
    } catch (e) {
      console.error(e)
      return null
    }
  },
  /**
   * @param {object|[object]} prop
   * 
   * @returns {object}
   * @throws {null} 
   */
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
    } catch (e) {
      console.error(e)
      return null
    }
  },
  /**
   * @param {object} user [UserSchema]
   * @param {object} oAuth [oAuth: { provider: string, id: integer }]
   * 
   * @returns {object}
   * @throws {null} 
   */
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
