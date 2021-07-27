const prisma = require('../db/prisma')

module.exports = {
  async fetchAll(model, page, order, filter, include) {
    try {
      const skipIndex = page > 1 ? (page - 1) * 10 : 0
      const limit = 10
      return {
        value: await prisma[model].findMany({
          where: filter,
          skip: skipIndex,
          orderBy: { id: order },
          take: limit,
          include,
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetch(model, id, include) {
    try {
      return {
        value: await prisma[model].findUnique({
          where: { id },
          include,
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async totalCount(model, filter) {
    try {
      return {
        value: await prisma[model].count({
          where: filter,
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
}
