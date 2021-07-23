const prisma = require('../db/prisma')

module.exports = {
  async extractValidRoles(roleIDs) {
    try {
      return {
        value: await prisma.role.findMany({
          where: {
            id: { in: roleIDs },
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async createRole(name, description, slug) {
    try {
      return {
        value: await prisma.role.create({
          data: {
            name,
            description,
            slug,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async updateRole(id, name, description, slug) {
    try {
      return {
        value: await prisma.role.update({
          where: { id },
          data: {
            name,
            description,
            slug,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      console.error('ERROR NAME', error.name)
      return { error }
    }
  },
  async deleteRole(id) {
    try {
      return {
        value: await prisma.role.delete({
          where: { id },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
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
