const prisma = require('../db/prisma')

module.exports = {
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
