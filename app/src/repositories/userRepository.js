const prisma = require('../db/prisma')

module.exports = {
  /**
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @param {object} profile
   * @param {[integer]} roles
   *
   * @returns {object}
   * @throws {null}
   */
  async createUser(
    email,
    password,
    username,
    profile,
    roles,
  ) {
    try {
      return {
        value: await prisma.user.create({
          data: {
            roles: {
              create: roles.map(role => ({
                role: {
                  connect: {
                    id: role.id,
                  },
                },
              })),
            },
            profile: {
              create: profile,
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
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  /**
   * @param {id} id
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @param {object} profile
   * @param {[object]} roles
   *
   * @returns {object}
   * @throws {null}
   */
  async updateUser(
    user,
    email,
    password,
    username,
    profile,
    roles,
  ) {
    try {
      const userRolesIDs = user.roles.map(role => role.role.id)
      const rolesToAdd = roles
        .filter(userRoleID => userRolesIDs.findIndex(ur => ur.id === userRoleID) === -1)
      const rolesToRemove = userRolesIDs
        .filter(userRoleID => roles.findIndex(ur => ur.id === userRoleID) === -1)

      let removeQuery
      if (rolesToRemove.length > 0) {
        removeQuery = `DELETE FROM "UserRoles" WHERE user_id = ${user.id} AND role_id IN (${rolesToRemove.toString()});`
      }

      let roleAddQuery
      if (rolesToAdd.length > 0) {
        roleAddQuery = {
          create: rolesToAdd.map(role => ({
            role: {
              connect: { id: role.id },
            },
          })),
        }
      }

      const {
        firstNameKanji, lastNameKanji, firstNameKana, lastNameKana,
        phoneNumber, address, gender,
      } = profile

      const updateQuery = {
        where: { id: user.id },
        data: {
          profile: {
            update: {
              firstNameKanji,
              lastNameKanji,
              firstNameKana,
              lastNameKana,
              phoneNumber,
              address,
              gender,
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
        return { value: transactionResult[1] }
      }
      return { value: await prisma.user.update(updateQuery) }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
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
      return {
        value: await prisma.user.delete({
          where: { id },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async findByOAuth(id) {
    try {
      return {
        value: await prisma.user.findUnique({
          where: {
            oAuthIDs: id,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
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
      return {
        value: await prisma.user.findUnique({
          where: param,
          include: {
            profile: true,
            oAuthIDs: true,
            roles: {
              include: { role: true },
            },
          },
        }),
      }
    } catch (e) {
      console.error(`User not found on prop : ${prop}, ${e}`)
      return { error: e }
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
    try {
      switch (oAuth.provider) {
        case 'google':
          if (!user.oAuthIDs.googleID) {
            return {
              value: await prisma.userOAuthIds.upsert({
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
              }),
            }
          }
          return { value: user }
        default:
          return { value: user }
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  /**
   *
   * Upserts users. Primarily for seeding purposes.
   *
   * @param {string} email
   * @param {string} username
   * @param {string} password
   * @param {string} firstName
   * @param {string} lastName
   * @param {[integer]} roles
   * @returns {object}
   */
  async upsert(
    email,
    username,
    password,
    firstNameKanji,
    lastNameKanji,
    firstNameKana,
    lastNameKana,
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
              firstNameKanji,
              lastNameKanji,
              firstNameKana,
              lastNameKana,
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
      console.error(`Exception : ${e}`)
      return null
    }
  },
}
