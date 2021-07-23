const prisma = require('../db/prisma')

module.exports = {
  async insertShop(name, areaID, prefectureID, cityID) {
    try {
      return prisma.shop.create({
        data: {
          name,
          area: {
            connect: { id: areaID },
          },
          prefecture: {
            connect: { id: prefectureID },
          },
          city: {
            connect: { id: cityID },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
  async updateShop(id, name, areaID, prefectureID, cityID) {
    try {
      return prisma.shop.update({
        where: { id },
        data: {
          name,
          area: {
            connect: { id: areaID },
          },
          prefecture: {
            connect: { id: prefectureID },
          },
          city: {
            connect: { id: cityID },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
  async deleteShop(id) {
    try {
      return prisma.shop.delete({
        where: { id },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      return null
    }
  },
}
