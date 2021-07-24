const prisma = require('../db/prisma')

module.exports = {
  async extractValidRoleIDs(roleIDs) {
    try {
      const validRoles = await prisma.role.findMany({
        where: {
          id: { in: roleIDs },
        },
      })

      return {
        value: validRoles.map(validRole => validRole.id),
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
  async findByProps(prop) {
    const param = Array.isArray(prop) ? { OR: prop } : prop
    try {
      return {
        value: await prisma.role.findUnique({
          where: param,
        }),
      }
    } catch (e) {
      console.error(`Role not found on prop : ${prop}, ${e}`)
      return { error: e }
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
