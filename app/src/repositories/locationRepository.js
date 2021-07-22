const prisma = require('../db/prisma')

module.exports = {
  async fetchCity(id) {
    try {
      return prisma.city.findUnique({
        where: { id },
        include: {
          prefecture: {
            include: {
              area: true,
            },
          },
        },
      })
    } catch (e) {
      console.error(e)
      return null
    }
  },
}
