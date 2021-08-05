const prisma = require('../db/prisma')
const CommonRepository = require('./CommonRepository')

const include = {
  profile: true,
  oAuthIDs: true,
  roles: {
    include: { role: true },
  },
}

const cleanRelationModels = user => {
  // merge profile into user
  const profileKeys = Object.keys(user.profile)
  profileKeys.forEach(key => {
    if (!(key === 'id' || key === 'userID')) {
      user[key] = user.profile[key]
    }
  })
  delete user.profile

  // clean roles
  user.roles = user.roles.map(role => ({
    name: role.role.name,
    description: role.role.description,
    slug: role.role.slug,
  }))
}

module.exports = {
  /**
   *
   * @param {int} page
   * @param {string} order asc / desc
   * @param {array[string]} filter array of param name to narrow results
   */
  async fetchUsers(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('user', page, order, filter, include)
      if (error) throw error

      data.forEach(datum => cleanRelationModels(datum))

      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async totalCount(filter) {
    try {
      const {
        error,
        value,
      } = await CommonRepository.totalCount('user', filter)
      if (error) throw error

      return { value }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchUser(id) {
    try {
      const { error, value: user } = await CommonRepository.fetch('user', id, include)
      if (error) throw error

      cleanRelationModels(user)

      return { value: user }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  /**
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @param {object} profile
   * @param {[integer]} roleIds
   *
   * @returns {object}
   * @throws {null}
   */
  async signupUser(
    email,
    password,
    username,
  ) {
    try {
      return {
        value: await prisma.user.create({
          data: {
            email,
            password,
            username,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async createUser(
    email,
    password,
    username,
    profile,
    roleIds,
  ) {
    try {
      return {
        value: await prisma.user.create({
          data: {
            roles: {
              create: roleIds.map(id => ({
                role: {
                  connect: { id },
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
   * @param {[integer]} rolesToAdd
   * @param {[integer]} rolesToRemove
   *
   * @returns {object}
   * @throws {null}
   */
  async updateUser(
    id,
    email,
    password,
    username,
    profile,
    rolesToAdd,
    rolesToRemove,
  ) {
    let removeQuery
    if (rolesToRemove.length > 0) {
      removeQuery = `DELETE FROM "UserRoles" WHERE user_id = ${id} AND role_id IN (${rolesToRemove.toString()});`
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
      where: { id },
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
    }
    try {
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
      const user = await prisma.user.findUnique({
        where: param,
        include,
      })
      if (user) {
        cleanRelationModels(user)
      }
      return { value: user }
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
