const prisma = require('../db/prisma')
const CommonRepository = require('./CommonRepository')

const include = {
  shop: true,
  stylist: true,
  user: {
    select: {
      id: true,
      profile: true,
    },
  },
}
// const parseReservation = reservation => {
//   // remove
// }
module.exports = {
  async fetchAll(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('reservation', page, order, filter, include)
      if (error) throw error

      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchReservation(id) {
    try {
      const { error, value: data } = await CommonRepository.fetch('reservation', id, include)
      if (error) throw error
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async totalCount(filter) {
    try {
      return {
        value: await CommonRepository.totalCount('reservation', filter),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async insertReservation(reservationDate, shopID, stylistID, userID) {
    try {
      return {
        value: await prisma.reservation.create({
          data: {
            reservationDate,
            shop: {
              connect: { id: shopID },
            },
            stylist: {
              connect: { id: stylistID },
            },
            user: {
              connect: { id: userID },
            },
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
}
