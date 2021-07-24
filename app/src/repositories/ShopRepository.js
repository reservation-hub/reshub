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
  async updateShop(shop, name, address, phoneNumber, areaID, prefectureID, cityID) {
    try {
      return {
        value: await prisma.shop.update({
          where: { id: shop.id },
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
  async findByProps(prop) {
    const param = Array.isArray(prop) ? { OR: prop } : prop
    try {
      return {
        value: await prisma.shop.findUnique({
          where: param,
        }),
      }
    } catch (e) {
      console.error(`Shop not found on prop : ${prop}, ${e}`)
      return { error: e }
    }
  },
  async findExistingShopIDs(ids) {
    try {
      const validShops = await prisma.shop.findMany({
        where: { id: { in: ids } },
      })
      return {
        value: validShops.map(shop => shop.id),
      }
    } catch (e) {
      console.error(`Shop not found on prop : ${ids.toString()}, ${e}`)
      return { error: e }
    }
  },
}
