const prisma = require('../db/prisma')

module.exports = {
  async extractValidRoles(roleIDs) {
    try {
      return prisma.role.findMany({
        where: {
          id: { in: roleIDs },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
  async fetchAll() {
    try {
      return prisma.role.findMany()
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
  async fetch(slug) {
    try {
      return prisma.role.findUnique({
        where: {
          ...slug,
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
  async create(values) {
    try {
      return prisma.role.create({
        data: values,
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
  async upsert(values) {
    try {
      return prisma.role.upsert({
        where: {
          slug: values.slug,
        },
        update: values,
        create: values,
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
}
