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
      return prisma.user.findUnique({
        where: param,
      })
    } catch (e) { return e }
  },
  async addIdFromPassportProfile(user, profile) {
    const data = {}
    switch (profile.provider) {
      case 'google':
        if (!user.googleID) data.googleID = profile.id
        break
      case 'twitter':
        if (!user.twitterID) data.twitterID = profile.id
        break
      case 'line':
        if (!user.lineID) data.lineID = profile.id
        break
      default:
        return user
    }

    try {
      return await prisma.user.update({
        where: { id: user.id },
        data,
      })
    } catch (e) { return e }
  },
}
