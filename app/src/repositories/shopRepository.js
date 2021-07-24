const prisma = require('../db/prisma')

module.exports = {
  async insertShop(name, address, phoneNumber, areaID, prefectureID, cityID) {
    try {
      return {
        value: await prisma.shop.create({
          data: {
            area: {
              connect: { id: areaID },
            },
            prefecture: {
              connect: { id: prefectureID },
            },
            city: {
              connect: { id: cityID },
            },
            shopDetail: {
              create: {
                name,
                address,
                phoneNumber,
              },
            },
          },
          include: {
            shopDetail: true,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async updateShop(id, name, address, phoneNumber, areaID, prefectureID, cityID) {
    try {
      return {
        value: await prisma.shop.update({
          where: { id },
          data: {
            area: {
              connect: { id: areaID },
            },
            prefecture: {
              connect: { id: prefectureID },
            },
            city: {
              connect: { id: cityID },
            },
            shopDetail: {
              update: {
                name,
                address,
                phoneNumber,
              },
            },
          },
          include: {
            shopDetail: true,
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
