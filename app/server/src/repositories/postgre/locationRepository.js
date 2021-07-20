const prisma = require('../../db/prisma')

module.exports = {
  async fetchAllAreas() {
    try {
      return prisma.area.findMany()
    } catch (e) { return e }
  },
}
