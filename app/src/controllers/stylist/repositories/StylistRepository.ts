import { StylistRepositoryInterface } from '@stylist/services/StylistService'
import prisma from '@lib/prisma'
import { convertEntityDayToPrismaDay, convertEntityOrderToRepositoryOrder } from '@prismaConverters/Common'
import { reconstructStylist } from '@prismaConverters/Stylist'

export const StylistRepository: StylistRepositoryInterface = {
  async fetchShopStylists(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const stylists = await prisma.stylist.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: { shop: { include: { shopDetail: true } } },
    })
    return stylists.map(reconstructStylist)
  },

  async fetchShopTotalStylistsCount(shopId) {
    return prisma.stylist.count({
      where: { shopId },
    })
  },

  async fetchShopStylist(shopId, stylistId) {
    const stylist = await prisma.stylist.findFirst({
      where: { id: stylistId, AND: { shopId } },
      include: { shop: { include: { shopDetail: true } } },
    })
    return stylist ? reconstructStylist(stylist) : null
  },

  async insertStylist(name, price, shopId, days, startTime, endTime) {
    const stylist = await prisma.stylist.create({
      data: {
        name,
        price,
        shop: {
          connect: { id: shopId },
        },
        days: days.map(d => convertEntityDayToPrismaDay(d)),
        startTime,
        endTime,
      },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylist = reconstructStylist(stylist)
    return cleanStylist
  },

  async updateStylist(id, name, price, shopId, days, startTime, endTime) {
    const stylist = await prisma.stylist.update({
      where: { id },
      data: {
        name,
        price,
        shop: { connect: { id: shopId } },
        days: days.map(d => convertEntityDayToPrismaDay(d)),
        startTime,
        endTime,
      },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylist = reconstructStylist(stylist)
    return cleanStylist
  },

  async deleteStylist(id) {
    const stylist = await prisma.stylist.delete({
      where: { id },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylist = reconstructStylist(stylist)
    return cleanStylist
  },

  async fetchStylistsReservationCounts(stylistIds) {
    const reservations = await prisma.reservation.groupBy({
      by: ['stylistId'],
      where: { stylistId: { in: stylistIds } },
      _count: true,
    })
    return reservations.map(r => ({
      stylistId: r.stylistId!,
      reservationCount: r._count,
    }))
  },
}

export default StylistRepository
