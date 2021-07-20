const prisma = require('../../db/prisma')

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
  // async findByProps(prop) {
  //   if (Array.isArray(prop)) {
  //     const email = prop[prop.findIndex(p => p.email !== undefined)]
  //   }
  //   try {
  //     return prisma.user.findUnique({
  //       where: {
  //         email
  //       }
  //     })
  //   } catch (e) { return e }
  // },
}
