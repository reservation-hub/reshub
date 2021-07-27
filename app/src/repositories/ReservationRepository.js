const prisma = require('../db/prisma')
const CommonRepository = require('./CommonRepository')

const include = {
  shop: {
    select: {
      shopDetail: true,
    },
  },
  stylist: true,
  user: {
    select: {
      profile: true,
    },
  },
}

const parseReservation = reservation => {
  if (reservation) {
    // clean shop
    const shopDetailKeys = Object.keys(reservation.shop.shopDetail)
    shopDetailKeys.filter(key => !(key === 'id' || key === 'shopID')).forEach(key => {
      reservation.shop[key] = reservation.shop.shopDetail[key]
    })
    delete reservation.shop.shopDetail

    // clean stylist
    reservation.stylist = reservation.stylist.name

    // clean user profile
    const userProfileKeys = Object.keys(reservation.user.profile)
    userProfileKeys.filter(key => !(key === 'id' || key === 'userID')).forEach(key => {
      reservation.user[key] = reservation.user.profile[key]
    })
    delete reservation.user.profile
  }
}

module.exports = {
  async fetchAll(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('reservation', page, order, filter, include)
      if (error) throw error
      data.forEach(datum => parseReservation(datum))
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchReservation(id) {
    try {
      const { error, value } = await CommonRepository.fetch('reservation', id, include)
      if (error) throw error
      parseReservation(value)
      return { value }
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
