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
      console.error(`Exception : ${e}`)
      return null
    }
  },
  async locationsAreValid(areaID, prefectureID, cityID) {
    try {
      const count = await prisma.city.count({
        where: {
          prefecture: {
            id: prefectureID,
            area: { id: areaID },
          },
          id: cityID,
        },
      })
      return { value: count !== 0 }
    } catch (e) {
      console.error(`Exception : ${e}`)
      return { error: e }
    }
  },
}
