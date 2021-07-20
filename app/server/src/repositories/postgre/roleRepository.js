const prisma = require('../../db/prisma')

module.exports = {
  async fetchAll() {
    try {
      return prisma.role.findMany()
    } catch (e) { return e }
  },
  async fetch(slug) {
    try {
      return prisma.role.findUnique({
        where: {
          ...slug,
        },
      })
    } catch (e) { return e }
  },
  async create(values) {
    try {
      return prisma.role.create({
        data: values,
      })
    } catch (e) { return e }
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
    } catch (e) { return e }
  },
}
