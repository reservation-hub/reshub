const prisma = require('../db/prisma')
const CommonRepository = require('./CommonRepository')

module.exports = {
  async fetchStylists(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('stylist', page, order, filter)
      if (error) throw error
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchStylist(id) {
    try {
      const { error, value } = await CommonRepository.fetch('stylist', id)
      if (error) throw error
      return { value }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async totalCount(filter) {
    try {
      const { error, value } = await CommonRepository.totalCount('stylist', filter)
      if (error) throw error
      return { value }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async insertStylist(name, shopIDs, image) {
    let imageQuery
    if (image) {
      imageQuery = {
        create: {
          image: {
            connect: {
              id: image.id,
            },
          },
        },
      }
    }

    try {
      return {
        value: await prisma.stylist.create({
          data: {
            name,
            shops: {
              create: shopIDs.map(id => ({
                shop: {
                  connect: { id },
                },
              })),
            },
            image: imageQuery,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async updateStylist(id, name, oldImage, newImage, shopIDsToAdd, shopIDsToRemove) {
    if (oldImage) {
      // TODO: delete image before adding new one
    }

    let removeQuery
    if (shopIDsToRemove.length > 0) {
      removeQuery = `
      DELETE
      FROM "ShopStylists"
      WHERE stylist_id = ${id}
      AND shop_id IN (${shopIDsToRemove.toString()});`
    }

    let shopAddQuery
    if (shopIDsToAdd.length > 0) {
      shopAddQuery = {
        create: shopIDsToAdd,
      }
    }

    let imageQuery
    if (newImage) {
      imageQuery = {
        create: {
          image: {
            connect: {
              id: newImage.id,
            },
          },
        },
      }
    }

    const updateQuery = {
      where: { id },
      data: {
        name,
        shops: shopAddQuery,
        image: imageQuery,
      },
    }

    try {
      // execute
      if (removeQuery) {
        const transactionResult = await prisma.$transaction([
          prisma.$queryRaw(removeQuery),
          prisma.stylist.update(updateQuery),
        ])
        return { value: transactionResult[1] }
      }
      return { value: await prisma.stylist.update(updateQuery) }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async deleteStylist(id) {
    try {
      return {
        value: await prisma.user.delete({
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
        value: await prisma.stylist.findUnique({
          where: param,
          include: {
            shops: {
              include: {
                shop: true,
              },
            },
          },
        }),
      }
    } catch (e) {
      console.error(`Stylist not found on prop : ${prop}, ${e}`)
      return { error: e }
    }
  },
}
