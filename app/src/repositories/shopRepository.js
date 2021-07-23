const prisma = require('../db/prisma')

module.exports = {
  async insertShop(name, areaID, prefectureID, cityID) {
    try {
      return {
        value: await prisma.shop.create({
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
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async updateShop(id, name, areaID, prefectureID, cityID) {
    try {
      return {
        value: await prisma.shop.update({
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
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async deleteShop(id) {
    try {
      return {
        value: await prisma.shop.delete({
          where: { id },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
}
