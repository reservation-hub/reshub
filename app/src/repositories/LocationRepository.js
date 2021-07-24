const prisma = require('../db/prisma')

module.exports = {
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
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
}
