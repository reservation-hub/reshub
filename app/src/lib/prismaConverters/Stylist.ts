import { Stylist as PrismaStylist } from '@prisma/client'
import { Stylist } from '@entities/Stylist'
import { convertPrismaDayToEntityDay } from '@prismaConverters/Common'

export const reconstructStylist = (stylist: PrismaStylist): Stylist => ({
  id: stylist.id,
  shopId: stylist.shopId,
  name: stylist.name,
  price: stylist.price,
  days: stylist.days.map(s => convertPrismaDayToEntityDay(s)),
  startTime: stylist.startTime,
  endTime: stylist.endTime,
})
