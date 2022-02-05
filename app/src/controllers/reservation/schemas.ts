import { dateTimePattern } from '@lib/RegexPatterns'
import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  take: z.number().optional(),
})

export const indexCalendarSchema = z.object({
  year: z.number().min(2000),
  month: z.number().min(1).max(12),
})

export const reservationUpsertSchema = z.object({
  reservationDate:
    z.string().regex(dateTimePattern),
  stylistId: z.number().positive().int(),
  userId: z.number().positive().int(),
  menuId: z.number().positive().int(),
})
