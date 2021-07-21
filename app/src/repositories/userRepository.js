const prisma = require('../db/prisma')

module.exports = {
  async createUser({
    email,
    password,
    username,
    firstName,
    lastName,
    roles,
  }) {
    try {
      return prisma.user.create({
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
            create: {
              firstName,
              lastName,
            },
          },
          email,
          password,
          username,
        },
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
  async upsert({
    email,
    username,
    password,
    firstName,
    lastName,
    roles,
  }) {
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
      let user = await prisma.user.findUnique({
        where: param,
        include: {
          profile: true,
          oAuthIDs: true,
          roles: {
            include: { role: true },
          },
        },
      })

      delete user.password
      user = { ...user, roles: user.roles.map(role => role.role) }

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
