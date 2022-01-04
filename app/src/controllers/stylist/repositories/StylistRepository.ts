import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { ScheduleDays } from '@entities/Common'
import { Stylist } from '@entities/Stylist'
import { StylistRepositoryInterface } from '@stylist/services/StylistService'
import prisma from '@/prisma'

const convertEntityDayToPrismaDay = (day: ScheduleDays): Days => {
  switch (day) {
    case ScheduleDays.MONDAY:
      return Days.MONDAY
    case ScheduleDays.TUESDAY:
      return Days.TUESDAY
    case ScheduleDays.WEDNESDAY:
      return Days.WEDNESDAY
    case ScheduleDays.THURSDAY:
      return Days.THURSDAY
    case ScheduleDays.FRIDAY:
      return Days.FRIDAY
    case ScheduleDays.SATURDAY:
      return Days.SATURDAY
    default:
      return Days.SUNDAY
  }
}

const convertPrismaDayToEntityDay = (day: Days): ScheduleDays => {
  switch (day) {
    case Days.MONDAY:
      return ScheduleDays.MONDAY
    case Days.TUESDAY:
      return ScheduleDays.TUESDAY
    case Days.WEDNESDAY:
      return ScheduleDays.WEDNESDAY
    case Days.THURSDAY:
      return ScheduleDays.THURSDAY
    case Days.FRIDAY:
      return ScheduleDays.FRIDAY
    case Days.SATURDAY:
      return ScheduleDays.SATURDAY
    default:
      return ScheduleDays.SUNDAY
  }
}

const reconstructStylist = (stylist: PrismaStylist): Stylist => ({
  id: stylist.id,
  shopId: stylist.shopId,
  name: stylist.name,
  price: stylist.price,
  days: stylist.days.map(s => convertPrismaDayToEntityDay(s)),
  startTime: stylist.startTime,
  endTime: stylist.endTime,
})

export const StylistRepository: StylistRepositoryInterface = {
  async fetchShopStylists(shopId, page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const stylists = await prisma.stylist.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
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
