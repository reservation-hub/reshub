const prisma = require('../db/prisma')
const CommonRepository = require('./CommonRepository')

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
  async fetchRoles(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('role', page, order, filter)
      if (error) throw error
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchRole(id) {
    try {
      const { error, value } = await CommonRepository.fetch('role', id)
      if (error) throw error
      return { value }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async totalCount(filter) {
    try {
      const { error, value } = await CommonRepository.totalCount('role', filter)
      if (error) throw error
      return { value }
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
