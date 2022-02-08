import { ScheduleDays, OrderBy } from '@entities/Common'
import { Days, Prisma } from '@prisma/client'

export const convertPrismaDayToEntityDay = (day: Days): ScheduleDays => {
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

export const convertEntityDayToPrismaDay = (day: ScheduleDays): Days => {
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

export const convertEntityOrderToRepositoryOrder = (order: OrderBy): Prisma.SortOrder => {
  switch (order) {
    case OrderBy.ASC:
      return Prisma.SortOrder.asc
    default:
      return Prisma.SortOrder.desc
  }
}
