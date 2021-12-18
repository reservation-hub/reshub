import { Stylist as PrismaStylist, Days } from '@prisma/client'
import { Stylist } from '@entities/Stylist'
import { ScheduleDays } from '@entities/Common'
import { StylistRepositoryInterface as ShopServiceSocket } from '@services/ShopService'
import prisma from './prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

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

export const reconstructStylist = (stylist: PrismaStylist): Stylist => ({
  id: stylist.id,
  shopId: stylist.shopId,
  name: stylist.name,
  price: stylist.price,
  days: stylist.days.map(s => convertPrismaDayToEntityDay(s)),
  startTime: stylist.startTime,
  endTime: stylist.endTime,
})

export const StylistRepository: CommonRepositoryInterface<Stylist> & ShopServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const stylists = await prisma.stylist.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
      include: { shop: { include: { shopDetail: true } } },
    })
    return stylists.map(stylist => reconstructStylist(stylist))
  },

  async totalCount() {
    return prisma.stylist.count()
  },

  async fetch(id) {
    const stylist = await prisma.stylist.findUnique({
      where: { id },
      include: { shop: { include: { shopDetail: true } } },
    })
    return stylist ? reconstructStylist(stylist) : null
  },

  async fetchStylistsByIds(userIds) {
    const stylists = await prisma.stylist.findMany({ where: { id: { in: userIds } } })
    return stylists.map(s => reconstructStylist(s))
  },

  async fetchStylistsByShopId(shopId) {
    const stylists = await prisma.stylist.findMany({
      where: { shopId },
    })
    return stylists.map(s => reconstructStylist(s))
  },

  async fetchShopStaffStylists(userId) {
    const stylists = await prisma.stylist.findMany({
      where: { shop: { shopUser: { userId } } },
    })
    return stylists.map(s => reconstructStylist(s))
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

  async fetchStylistsByShopIds(shopIds) {
    const stylists = await prisma.stylist.findMany({
      where: { shopId: { in: shopIds } },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylists = stylists.map(stylist => ({
      id: stylist.id,
      name: stylist.name,
      price: stylist.price,
      shopId: stylist.shopId,
    }))
    return cleanStylists
  },

  async fetchStylistsCountByShopIds(shopIds) {
    const stylists = await this.fetchStylistsByShopIds(shopIds)
    const finalData = shopIds.map(id => ({ id, count: stylists.filter(stylist => id === stylist.shopId).length }))
    return finalData
  },

}

export default StylistRepository
